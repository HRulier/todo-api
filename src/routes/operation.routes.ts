import { Router } from "express";
import z from "~/utils/zod/zod-extended";
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

operationRoutes.patch(
  "/:shortId",
  verifyApiKey,
  validateRequest({
    body: z.object({ status: z.enum(["pending", "approved", "rejected"]) }),
  }),
  OperationController.updateAndExecuteOperation
);

export default operationRoutes;
