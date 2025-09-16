import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Img,
} from "@react-email/components";
import * as React from "react";

interface EmailProps {
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
}

export default function BookingRequestEmail({
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
}: EmailProps) {
  return (
    <Html>
      <Head>
        <Preview>Nouvelle demande de réservation - Agence Mirna</Preview>
      </Head>
      <Body style={main}>
        <Container>
          <Section style={sectionStyle}>
            <Img
              src={propertyImage}
              alt={propertyName}
              width="600"
              height="300"
              style={imageStyle}
            />
            <Heading as="h1" style={headingStyle}>
              Nouvelle demande de réservation
            </Heading>
            <Text style={subheadingStyle}>
              Une nouvelle demande de réservation a été reçue pour la propriété
              suivante :
            </Text>
            <Text style={propertyNameStyle}>{propertyName}</Text>
            <Text>
              <strong>Nom :</strong> {lastName}
            </Text>
            <Text>
              <strong>Prénom :</strong> {firstName}
            </Text>
            <Text>
              <strong>Email :</strong> {email}
            </Text>
            <Text>
              <strong>Téléphone :</strong> {phone}
            </Text>
            <Text>
              <strong>Date d&apos;arrivée :</strong> {checkIn}
            </Text>
            <Text>
              <strong>Date de départ :</strong> {checkOut}
            </Text>
            <Text>
              <strong>Nombre de personnes :</strong> {guests}
            </Text>
            <Text>
              <strong>Message :</strong>
            </Text>
            <Text>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const sectionStyle = {
  marginTop: "32px",
  textAlign: "center" as const,
};

const imageStyle = {
  width: "100%",
  maxWidth: "600px",
  height: "auto",
  borderRadius: "12px",
  objectFit: "cover" as const,
};

const headingStyle = {
  fontSize: "36px",
  fontWeight: "600",
  lineHeight: "40px",
  letterSpacing: "0.4px",
  color: "#111827",
};

const subheadingStyle = {
  marginTop: "8px",
  fontSize: "16px",
  lineHeight: "24px",
  color: "#6B7280",
};

const propertyNameStyle = {
  fontSize: "18px",
  fontWeight: "600",
  lineHeight: "28px",
  color: "#4F46E5",
  marginTop: "16px",
};

// ... You can add more styles for other elements if needed ...
