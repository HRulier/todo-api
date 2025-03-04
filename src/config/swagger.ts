import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";
// import fs from "fs";

// // Load schemas from JSON file
// const schemas = JSON.parse(
//   fs.readFileSync(path.resolve(__dirname, "../docs/schemas/todo.json"), "utf-8")
// );

import todoSchema from "../docs/schemas/todo.json";
import userSchema from "../docs/schemas/user.json";
import errorSchema from "../docs/schemas/error.json";

export const setupSwagger = (app: Express) => {
  const options: swaggerJSDoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Todo API",
        version: "1.0.0",
        description: "API Documentation",
        // contact: {
        //   name: "",
        //   email: "",
        // },
        // license: {
        //   name: "MIT",
        //   url: "https://opensource.org/licenses/MIT",
        // },
      },
      servers: [
        {
          url: process.env.API_URL || "http://localhost:1700",
          description: "Development server",
        },
      ],
      tags: [
        {
          name: "Authentication",
          description:
            "Operations related to user authentication and authorization",
        },
        {
          name: "Todos",
          description: "Todo management operations",
        },
      ],
      components: {
        schemas: {
          ...todoSchema,
          ...userSchema,
          ...errorSchema,
        },
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
          },
        },
      },
    },
    // Include route files with JSDoc annotations AND external YAML docs
    apis: [
      path.resolve(__dirname, "../routes/*.ts"), // Extract JSDoc comments
    ],
  };

  const specs = swaggerJSDoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
