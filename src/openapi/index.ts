import { generator } from "./registry";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Créer le document OpenAPI final
export const createOpenApiDocument = () => {
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
        url: process.env.API_URL || "http://localhost:1700",
        description: "Development server",
      },
    ],
    tags: [{ name: "Tasks", description: "Tasks management operations" }],
  });
};
