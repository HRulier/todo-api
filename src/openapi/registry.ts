import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  // bearerFormat: 'JWT',
});

const generator = new OpenApiGeneratorV31(registry.definitions);

export { registry, generator };
