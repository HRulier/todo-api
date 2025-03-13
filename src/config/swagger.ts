import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";

import errorSchemas from "../docs/errors";

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
          ...errorSchemas,
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
