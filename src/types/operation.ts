import z from "~/utils/zod/zod-extended";
import { Response } from "express";
import { IAuthentificateRequest } from "./auth";
import { OperationSchema } from "~/schemas/operation.schema";

export type OperationDocument = z.infer<typeof OperationSchema>;

export interface IOperationController {
  createOperation: (req: IAuthentificateRequest, res: Response) => void;
}