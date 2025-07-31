import z from "~/utils/zod/zod-extended";
import { Response } from "express";
import { IAuthentificateRequest } from "./auth";
import { TagSchema } from "~/schemas/tag.schema";

// Types inferred
export type TagDocument = z.infer<typeof TagSchema>;

export interface ITagController {
  getTags: (req: IAuthentificateRequest, res: Response) => void;
  createTags: (req: IAuthentificateRequest, res: Response) => void;
}
