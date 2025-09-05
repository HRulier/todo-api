import z from "~/utils/zod/zod-extended";
import { Response, Request } from "express";
import { OperationSchema } from "~/schemas/operation.schema";

export type OperationDocument = z.infer<typeof OperationSchema>;

export interface IOperationController {
  createOperation: (req: Request, res: Response) => void;
  updateAndExecuteOperation: (req: Request, res: Response) => void;
}
