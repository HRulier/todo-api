import { Application, Router } from "express";
import dotenv from "dotenv";

import "~/config/passport";
import dotEnvConfig from "~/config/dot-env";

import unknownRoutesHandler from "~/middlewares/unknownRoutes.handler";
import limiter from "~/middlewares/rateLimiter.handler";

import AuthRoutes from "./auth.routes";

dotenv.config(dotEnvConfig);

const { authLimiter } = limiter;

export default function (app: Application) {
  // Initializing route groups
  const apiRoutes = Router();

  if (process.env.NODE_ENV === "production") {
    apiRoutes.use("/auth", authLimiter);
  }
  apiRoutes.use("/auth", AuthRoutes);

  // Set url for API group routes
  app.use("/api", apiRoutes);
  app.all("*", unknownRoutesHandler);
}
