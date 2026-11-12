"use server";

import BookingRequestEmail from "@/emails/booking_asking.email";
import BookingRequestConfirmationEmail from "@/emails/booking_asking_confirmation.email";
import { Resend } from "resend";
import { getSiteContact } from "@/src/lib/site-contact";
import { evaluerDemande, type ControleAntiRobot } from "@/src/lib/anti-spam";

let resendInstance: Resend | null = null;
function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY n'est pas définie");
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export async function BookingRequest({
  firstName,
  lastName,
  email,
  phone,
  propertyName,
  checkIn,
  checkOut,
  guests,
  message,
  propertyImage,
  anti_robot,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  message: string;
  propertyImage: string;
  anti_robot?: ControleAntiRobot | null;
}) {
  // Même tri que `createLead` : sans lui, cette action publique envoyait un
  // e-mail à l'agence et un accusé de réception à N'IMPORTE QUELLE adresse
  // saisie par un robot. Une demande suspecte reçoit une réponse « succès »
  // sans qu'aucun e-mail parte.
  const verdict = evaluerDemande({
    source: "contact",
    full_name: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
    email,
    message,
    anti_robot,
  });
  if (verdict.action !== "accepter") {
    return { success: true as const };
  }

  // Le destinataire suit l'adresse saisie dans /admin/parametres : en dur,
  // changer l'email du back-office n'avait aucun effet sur les demandes de
  // réservation, qui partaient toujours à l'ancienne adresse.
  const { email: emailAgence } = await getSiteContact();

  try {
    // Envoi de l'e-mail de demande de réservation à l'agence
    const { data: requestData, error: requestError } = await getResend().emails.send(
      {
        from: "website@agencemirna.com",
        to: [emailAgence],
        subject: "Nouvelle demande de réservation - Agence Mirna",
        react: BookingRequestEmail({
          firstName,
          lastName,
          email,
          phone,
          propertyName,
          checkIn,
          checkOut,
          guests,
          message,
          propertyImage,
        }),
      }
    );

    if (requestError) {
      return { success: false, error: requestError.message };
    }

    // Envoi de l'e-mail de confirmation au client
    const { data: confirmationData, error: confirmationError } =
      await getResend().emails.send({
        from: emailAgence,
        to: [email],
        subject: "Confirmation de votre demande de réservation - Agence Mirna",
        react: BookingRequestConfirmationEmail({
          firstName,
          lastName,
          propertyName,
          checkIn,
          checkOut,
          guests,
        }),
      });

    if (confirmationError) {
      return { success: false, error: confirmationError.message };
    }

    return { success: true, data: { requestData, confirmationData } };
  } catch {
    // Le détail de l'erreur Resend n'est pas exposé au client : on renvoie
    // le même message générique, la liaison du catch est donc inutile.
    return {
      success: false,
      error: "Une erreur s'est produite lors de l'envoi des e-mails",
    };
  }
}
