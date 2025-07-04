import { Response } from "express";
import mongoose from "mongoose";
import z from "~/utils/zod/zod-extended";
import { IUser } from "./users";
import { IAuthentificateRequest } from "./auth";
import { CreateTaskSchema, UpdateTaskSchema } from "~/schemas/task.schema";

// Types inferred
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

// Extend type for task document
export type TaskDocument = CreateTaskInput & {
  _id: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  completed: boolean;
  user: IUser;
};

export interface ITaskController {
  getTasks: (req: IAuthentificateRequest, res: Response) => void;
  getTaskById: (req: IAuthentificateRequest, res: Response) => void;
  createTask: (req: IAuthentificateRequest, res: Response) => void;
  updateTask: (req: IAuthentificateRequest, res: Response) => void;
  deleteTask: (req: IAuthentificateRequest, res: Response) => void;
}
