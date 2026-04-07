import { Application, Router } from "express";
import { serve, setup } from "swagger-ui-express";
import dotenv from "dotenv";

import "~/config/passport";
import dotEnvConfig from "~/config/dot-env";

import unknownRoutesHandler from "~/middlewares/unknownRoutes.handler";
import limiter from "~/middlewares/rateLimiter.handler";

import AuthRoutes from "./auth.routes";
import TasksRoutes from "./task.routes";
import TagsRoutes from "./tag.routes";
import JobsRoutes from "./job.routes";
import OperationRoutes from "./operation.routes";
import OAuthRoutes from "~/mcp/oauth/routes/oauth.routes";

import { createOpenApiDocument } from "~/openapi";
dotenv.config(dotEnvConfig);

const { authLimiter } = limiter;

export default function (app: Application) {
  const openApiDocument = createOpenApiDocument();

  // ── MCP OAuth routes (root-level, not under /api) ──────────────────────
  // Well-known discovery + authorize + token + register endpoints must be
  // accessible at the root so MCP clients can find them via RFC 8414/9728.
  app.use("/", OAuthRoutes);

  // Initializing route groups
  const apiRoutes = Router();

  if (process.env.NODE_ENV === "production") {
    apiRoutes.use("/auth", authLimiter);
  }

  apiRoutes.use("/auth", AuthRoutes);
  apiRoutes.use("/tasks", TasksRoutes);
  apiRoutes.use("/tags", TagsRoutes);
  apiRoutes.use("/jobs", JobsRoutes);
  apiRoutes.use("/operations", OperationRoutes);

  // Set url for API group routes
  app.use("/api", apiRoutes);
  // Set url for API docs
  app.use("/api-docs", serve, setup(openApiDocument));
  app.all("*", unknownRoutesHandler);
}
