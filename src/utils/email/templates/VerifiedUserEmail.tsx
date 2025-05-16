import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface VerifiedUserEmailProps {
  username: string;
  url: string;
}

export const VerifiedUserEmail = ({
  username,
  url,
}: VerifiedUserEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Confirmation de votre inscription</Preview>
      <Container style={container}>
        <Section style={header}>
          <Text style={title}>{process.env.PROJECT_NAME}</Text>
        </Section>
        <Section style={sectionsBorders}>
          <Row>
            <Column style={sectionBorder} />
            <Column style={sectionCenter} />
            <Column style={sectionBorder} />
          </Row>
        </Section>
        <Section style={content}>
          <Text style={paragraph}>Bonjour {username},</Text>
          <Text style={paragraph}>
            Merci d'avoir créer un compte. Afin de finaliser votre inscription,
            nous vous invitons à cliquer sur le lien suivant:
          </Text>
          <Text style={paragraph}>
            <Link href={url} style={link}>
              Confirmer mon inscription.
            </Link>
          </Text>
          <Text style={paragraph}>
            (vous disposez de 24heures pour utiliser ce lien.)
          </Text>
          <Text style={paragraph}>
            Si vous n'êtes pas à l'origine de cette demande, ignorez simplement
            cet e-mail.
          </Text>
          <Text style={paragraph}>
            Cordialement,
            <br />
            Loneless Todo-app
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default VerifiedUserEmail;

const fontFamily = "HelveticaNeue,Helvetica,Arial,sans-serif";

const main = {
  backgroundColor: "#efeef1",
  fontFamily,
  padding: "30px",
};

const title = {
  lineHeight: 1.5,
  fontWeight: "bold",
  fontSize: 20,
  textAlign: "center" as const,
};

const paragraph = {
  lineHeight: 1.5,
  fontSize: 14,
};

const container = {
  maxWidth: "580px",
  margin: "30px auto",
  backgroundColor: "#ffffff",
};

const content = {
  padding: "5px 20px 10px 20px",
};

const header = {
  padding: "30px",
};

const sectionsBorders = {
  width: "100%",
  display: "flex",
};

const sectionBorder = {
  borderBottom: "1px solid rgb(238,238,238)",
  width: "249px",
};

const sectionCenter = {
  borderBottom: "1px solid rgb(145,71,255)",
  width: "102px",
};

const link = {
  textDecoration: "underline",
};
