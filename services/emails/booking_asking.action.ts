"use server";

import BookingRequestEmail from "@/emails/booking_asking.email";
import BookingRequestConfirmationEmail from "@/emails/booking_asking_confirmation.email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
}) {
  try {
    // Envoi de l'e-mail de demande de réservation à l'agence
    const { data: requestData, error: requestError } = await resend.emails.send(
      {
        from: "website@agencemirna.com",
        to: ["info@agencemirna.com"],
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
      await resend.emails.send({
        from: "info@agencemirna.com",
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
  } catch (error) {
    return {
      success: false,
      error: "Une erreur s'est produite lors de l'envoi des e-mails",
    };
  }
}
