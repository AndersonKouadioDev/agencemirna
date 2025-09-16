import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailProps {
  firstName: string;
  lastName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export default function BookingRequestConfirmationEmail({
  firstName,
  lastName,
  propertyName,
  checkIn,
  checkOut,
  guests,
}: EmailProps) {
  return (
    <Html>
      <Head>
        <Preview>
          Confirmation de votre demande de réservation - Agence Mirna
        </Preview>
      </Head>
      <Body style={main}>
        <Container>
          <Section>
            <Heading as="h1">
              Confirmation de votre demande de réservation
            </Heading>
            <Text>
              Cher(e) {firstName} {lastName},
            </Text>
            <Text>
              Nous avons bien reçu votre demande de réservation pour la
              propriété suivante :
            </Text>
            <Text style={propertyNameStyle}>{propertyName}</Text>
            <Text>Détails de votre réservation :</Text>
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
              Notre équipe examinera votre demande dans les plus brefs délais et
              vous contactera pour confirmer la disponibilité et finaliser votre
              réservation.
            </Text>
            <Text>
              Si vous avez des questions ou besoin d&apos;informations
              supplémentaires, n&apos;hésitez pas à nous contacter.
            </Text>
            <Text>Cordialement,</Text>
            <Text>L&apos;équipe de l&apos;Agence Mirna</Text>
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

const propertyNameStyle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#4F46E5",
  marginTop: "16px",
  marginBottom: "16px",
};
