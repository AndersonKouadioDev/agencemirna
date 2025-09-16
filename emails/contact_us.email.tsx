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
  email: string;
  phone: string;
  message: string;
}

export default function ContactUsEmail({
  firstName,
  lastName,
  email,
  phone,
  message,
}: EmailProps) {
  return (
    <Html>
      <Head>
        <Preview>Nouveau message de contact - Agence Mirna</Preview>
      </Head>
      <Body style={main}>
        <Container>
          <Section>
            <Heading as="h1">Nouveau message de contact</Heading>
            <Text>
              Un nouveau message a été envoyé via le formulaire de contact :
            </Text>
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
