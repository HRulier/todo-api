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

interface ResetPasswordEmailProps {
  username: string;
  url: string;
}

export const ResetPasswordEmail = ({
  username,
  url,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Demande de réinitialisation de votre mot de passe</Preview>
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
            Nous avons reçu une demande de réinitialisation de votre mot de
            passe. Pour en choisir un nouveau, cliquez sur le lien ci-dessous :
          </Text>
          <Text style={paragraph}>
            <Link href={url} style={link}>
              Changer mon mot de passe
            </Link>
          </Text>
          <Text style={paragraph}>
            (vous disposez de 24heures pour utiliser ce lien.)
          </Text>
          <Text style={paragraph}>
            Si vous n'êtes pas à l'origine de cette demande, ignorez simplement
            cet e-mail. Votre mot de passe actuel restera inchangé.
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

export default ResetPasswordEmail;

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
  padding: "15px",
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
