import { Router } from "express";
import OperationController from "~/controllers/operation.controller";
import verifyApiKey from "~/middlewares/verifyApiKey.handler";
import validateRequest from "~/middlewares/validateRequest.handler";
import { CreateOperationSchema } from "~/schemas/operation.schema";

const operationRoutes = Router();

operationRoutes.post(
  "/",
  verifyApiKey,
  validateRequest({ body: CreateOperationSchema }),
  OperationController.createOperation
);

export default operationRoutes;
