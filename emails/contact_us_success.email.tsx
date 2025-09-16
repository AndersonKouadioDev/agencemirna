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
}

export default function ContactUsSuccessEmail({
  firstName,
  lastName,
}: EmailProps) {
  return (
    <Html>
      <Head>
        <Preview>Confirmation de votre message - Agence Mirna</Preview>
      </Head>
      <Body style={main}>
        <Container>
          <Section>
            <Heading as="h1">Merci pour votre message</Heading>
            <Text>
              Cher(e) {firstName} {lastName},
            </Text>
            <Text>
              Nous avons bien reçu votre message via notre formulaire de
              contact. Nous vous remercions de nous avoir contactés.
            </Text>
            <Text>
              Notre équipe examinera votre demande dans les plus brefs délais et
              vous répondra rapidement.
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
