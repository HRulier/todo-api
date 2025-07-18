import z from "~/utils/zod/zod-extended";
import { Response } from "express";
import { IAuthentificateRequest } from "./auth";
import { CategorySchema } from "~/schemas/category.schema";

// Types inferred
export type CategoryDocument = z.infer<typeof CategorySchema>;

export interface ICategoryController {
  getCategories: (req: IAuthentificateRequest, res: Response) => void;
}
