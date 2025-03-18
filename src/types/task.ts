import { Response } from "express";
import mongoose from "mongoose";
import { z } from "~/utils/zod/zod-extended";
import { IUser } from "./users";
import { IAuthentificateRequest } from "./auth";
import { createTaskSchema, updateTaskSchema } from "~/schemas/task.schema";

// Types inferred
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// Extend type for task document
export type TaskDocument = CreateTaskInput & {
  _id: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  user: IUser;
};

export interface ITaskController {
  getTasks: (req: IAuthentificateRequest, res: Response) => void;
  getTaskById: (req: IAuthentificateRequest, res: Response) => void;
  createTask: (req: IAuthentificateRequest, res: Response) => void;
  updateTask: (req: IAuthentificateRequest, res: Response) => void;
  deleteTask: (req: IAuthentificateRequest, res: Response) => void;
}
