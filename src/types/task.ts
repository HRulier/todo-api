import { Response, Request } from "express";
import mongoose from "mongoose";
import z from "~/utils/zod/zod-extended";
import { IUser } from "./users";
import { IAuthentificateRequest } from "./auth";
import {
  CreateTaskSchema,
  CreateTasksWithUserSchema,
  UpdateTaskSchema,
} from "~/schemas/task.schema";

// Types inferred
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type CreateTasksWithUserInput = z.infer<
  typeof CreateTasksWithUserSchema
>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

// Extend type for task document
export type TaskDocument = CreateTaskInput & {
  _id: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  completed: boolean;
  position: number;
  user: IUser;
  tags: TaskDocument[];
};

export interface ITaskController {
  getTasks: (req: IAuthentificateRequest, res: Response) => void;
  getTaskById: (req: IAuthentificateRequest, res: Response) => void;
  createTask: (req: IAuthentificateRequest, res: Response) => void;
  createTasks: (req: Request, res: Response) => void;
  updateTask: (req: IAuthentificateRequest, res: Response) => void;
  deleteTask: (req: IAuthentificateRequest, res: Response) => void;
}
