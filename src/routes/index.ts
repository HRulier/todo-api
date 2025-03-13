import { Application, Router } from "express";
import dotenv from "dotenv";

import "~/config/passport";
import dotEnvConfig from "~/config/dot-env";

import unknownRoutesHandler from "~/middlewares/unknownRoutes.handler";
import limiter from "~/middlewares/rateLimiter.handler";

import AuthRoutes from "./auth.routes";
import TasksRoutes from "./task.routes";

dotenv.config(dotEnvConfig);

const { authLimiter } = limiter;

export default function (app: Application) {
  // Initializing route groups
  const apiRoutes = Router();

  if (process.env.NODE_ENV === "production") {
    apiRoutes.use("/auth", authLimiter);
  }

  apiRoutes.use("/auth", AuthRoutes);
  apiRoutes.use("/tasks", TasksRoutes);

  // Set url for API group routes
  app.use("/api", apiRoutes);
  app.all("*", unknownRoutesHandler);
}
