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
  Link,
} from "@react-email/components";
import dotenv from "dotenv";
import dotEnvConfig from "~/config/dot-env";

import * as React from "react";

import type { TaskDocument } from "~/types/task";

dotenv.config(dotEnvConfig);

interface DailyReminderEmailProps {
  username: string;
  tasks: TaskDocument[];
}

const examplesTasks = [
  {
    _id: "64f3a2b1c5e8d9f2a1b3c4d5",
    description: "Arroser les plantes du balcon",
    dueDate: "2025-07-30T22:00:00.000Z",
    user: {
      profile: {
        firstName: "Alice",
        lastName: "Martin",
      },
      _id: "64e9b7c8d2f1a3e4b5c6d7e8",
      email: "alice.martin@example.com",
    },
    tags: [],
  },
  {
    _id: "64f3a2b2c5e8d9f2a1b3c4d6",
    description: "Préparer le petit-déjeuner",
    dueDate: "2025-07-30T22:00:00.000Z",
    user: {
      profile: {
        firstName: "Bob",
        lastName: "Johnson",
      },
      _id: "64e9b7c9d2f1a3e4b5c6d7e9",
      email: "bob.johnson@example.com",
    },
    tags: [
      {
        _id: "64f1c8d3e4f5a6b7c8d9e0f1",
        label: "Matinal",
        color: "#B3E5FF",
      },
      {
        _id: "64f1c8d4e4f5a6b7c8d9e0f2",
        label: "Quotidien",
        color: "#FFB3E6",
      },
    ],
  },
  {
    _id: "64f3a2b3c5e8d9f2a1b3c4d7",
    description: "Ranger le bureau",
    dueDate: "2025-07-30T22:00:00.000Z",
    user: {
      profile: {
        firstName: "Charlie",
        lastName: "Brown",
      },
      _id: "64e9b7cad2f1a3e4b5c6d7ea",
      email: "charlie.brown@example.com",
    },
    tags: [
      {
        _id: "64f2d5e6f7a8b9c0d1e2f3a4",
        label: "Bureau",
        color: "#FFE6B3",
      },
      {
        _id: "64f2d5e7f7a8b9c0d1e2f3a5",
        label: "Organisation",
        color: "#F0B3FF",
      },
      {
        _id: "64f2d5e8f7a8b9c0d1e2f3a6",
        label: "Maison",
        color: "#B3FFD9",
      },
    ],
  },
  {
    _id: "64f3a2b4c5e8d9f2a1b3c4d8",
    description: "Terminer la lecture du livre commencé la semaine dernière",
    dueDate: "2025-07-30T22:00:00.000Z",
    user: {
      profile: {
        firstName: "Diana",
        lastName: "Wilson",
      },
      _id: "64e9b7cbd2f1a3e4b5c6d7eb",
      email: "diana.wilson@example.com",
    },
    tags: [
      {
        _id: "64f3e9f0a1b2c3d4e5f6a7b8",
        label: "Loisir",
        color: "#B3E5FF",
      },
      {
        _id: "64f3e9f1a1b2c3d4e5f6a7b9",
        label: "Lecture",
        color: "#FFD9B3",
      },
      {
        _id: "64f3e9f2a1b2c3d4e5f6a7ba",
        label: "Personnel",
        color: "#FFFFB3",
      },
      {
        _id: "64f3e9f3a1b2c3d4e5f6a7bb",
        label: "Culture",
        color: "#B3FFB3",
      },
    ],
  },
];

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

          {(process.env.NODE_ENV === "development" ? examplesTasks : tasks).map(
            (task) => (
              <Section
                key={
                  process.env.NODE_ENV === "development"
                    ? task._id
                    : task._id.toString()
                }
                style={taskItem}
              >
                <Text style={taskDescription}>⏳ {task.description}</Text>
                {task.tags && task.tags.length > 0 && (
                  <div style={tags}>
                    {task.tags.map((taskTag: any) => (
                      <span
                        key={
                          process.env.NODE_ENV === "development"
                            ? task._id
                            : task._id.toString()
                        }
                        style={{ ...tag, backgroundColor: taskTag.color }}
                      >
                        {taskTag.label}
                      </span>
                    ))}
                  </div>
                )}
              </Section>
            )
          )}

          <Text style={paragraph}>
            <Link href={`${process.env.FRONT_URL}`} style={link}>
              🔗 Gérer mes tâches
            </Link>
            <br />{" "}
            <Link
              href={`${process.env.FRONT_URL}/profile?redirect`}
              style={link}
            >
              ❌ Ne plus recevoir de rappel
            </Link>
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

const link = {
  textDecoration: "underline",
};
