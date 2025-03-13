import {
  // OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import registry from "./registry";
import "./paths";

// Créer le document OpenAPI final
export const createOpenApiDocument = () => {
  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Todo Management API",
      version: "1.0.0",
      description: "API Documentation",
      // contact: {
      //   name: "Nom",
      //   email: "",
      // },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:1700/api",
        description: "Development server",
      },
    ],
    tags: [{ name: "Tasks", description: "Tasks management operations" }],
  });
};
