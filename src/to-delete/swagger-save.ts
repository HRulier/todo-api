import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";

export const setupSwagger = (app: Express) => {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Todo API",
        version: "1.0.0",
        description: "API Documentation",
      },
      servers: [
        {
          url: process.env.API_URL || "http://localhost:1700",
          description: "Development server",
        },
      ],
    },
    // Look for JSDoc comments in code AND the separate YAML files
    apis: [
      path.resolve(__dirname, "../routes/*.ts"),
      path.resolve(__dirname, "../docs/**/*.yaml"),
    ],
  };

  const specs = swaggerJSDoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
