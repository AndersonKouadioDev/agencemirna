"use server";

import ContactUsEmail from "@/emails/contact_us.email";
import ContactUsSuccessEmail from "@/emails/contact_us_success.email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function ContactUs({
  firstName,
  lastName,
  email,
  phone,
  message,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}) {
  try {
    // Envoi de l'e-mail de contact à l'agence
    const { data: contactData, error: contactError } = await resend.emails.send(
      {
        from: "website@agencemirna.com",
        to: ["info@agencemirna.com"],
        subject: "Prise de contact Site web Agence Mirna",
        react: ContactUsEmail({
          firstName,
          lastName,
          email,
          phone,
          message,
        }),
      }
    );

    if (contactError) {
      return { success: false, error: contactError.message };
    }

    // Envoi de l'e-mail de confirmation au client
    const { data: successData, error: successError } = await resend.emails.send(
      {
        from: "info@agencemirna.com",
        to: [email],
        subject: "Confirmation de votre prise de contact Agence Mirna",
        react: ContactUsSuccessEmail({
          firstName,
          lastName,
        }),
      }
    );

    if (successError) {
      return { success: false, error: successError.message };
    }

    return { success: true, data: { contactData, successData } };
  } catch (error) {
    return {
      success: false,
      error: "Une erreur s'est produite lors de l'envoi des e-mails",
    };
  }
}
