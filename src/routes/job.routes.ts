import { Router } from "express";
import JobController from "~/controllers/jobs.controller";
import verifyApiKey from "~/middlewares/verifyApiKey.handler";

const jobsRoutes = Router();

jobsRoutes.get(
  "/send-daily-emails",
  verifyApiKey,
  JobController.sendDailyEmail
);

export default jobsRoutes;
