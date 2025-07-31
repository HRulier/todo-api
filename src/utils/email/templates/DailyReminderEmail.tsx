import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

import type { TaskDocument } from "~/types/task";

interface DailyReminderEmailProps {
  username: string;
  tasks: TaskDocument[];
}

export const DailyReminderEmail = ({
  username,
  tasks = [],
}: DailyReminderEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>
        Rappel quotidien - {tasks.length.toString()} tâche(s) prévue(s)
        aujourd'hui
      </Preview>
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
          <Text style={paragraph}>🌅 Bonjour {username},</Text>
          <Text style={paragraph}>
            Voici un rappel de ce qui vous avez prévus aujourd'hui :
          </Text>

          {tasks.map((task) => (
            <Section key={task._id.toString()} style={taskItem}>
              <Text style={taskDescription}>⏳ {task.description}</Text>
              {task.tags && task.tags.length > 0 && (
                <div style={tags}>
                  {task.tags.map((taskTag: any) => (
                    <span
                      key={taskTag._id.toString()}
                      style={{ ...tag, backgroundColor: taskTag.color }}
                    >
                      {taskTag.label}
                    </span>
                  ))}
                </div>
              )}
            </Section>
          ))}

          <Text style={paragraph}>
            🔗 Gérer mes tâches :
            <br />❌ Ne plus recevoir de rappel :{" "}
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

export default DailyReminderEmail;

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

const taskItem = {
  marginBottom: "16px",
  padding: "12px",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  backgroundColor: "#f9fafb",
};

const taskDescription = {
  margin: "0 0 8px 0",
  fontSize: "14px",
  fontWeight: "500",
};

const tags = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "4px",
};

const tag = {
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: "500",
  color: "#374151",
};
