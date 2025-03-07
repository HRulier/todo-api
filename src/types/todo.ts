import { Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { IUser } from "./users";
import { IAuthentificateRequest } from "./auth";
import { createTodoSchema, updateTodoSchema } from "~/schemas/todo.schema";

// Types inferred
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;

// Extend type for todo document
export type TodoDocument = CreateTodoInput & {
  _id: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  user: IUser;
};

export interface ITodoController {
  getTodos: (req: IAuthentificateRequest, res: Response) => void;
  getTodoById: (req: IAuthentificateRequest, res: Response) => void;
  createTodo: (req: IAuthentificateRequest, res: Response) => void;
  updateTodo: (req: IAuthentificateRequest, res: Response) => void;
  deleteTodo: (req: IAuthentificateRequest, res: Response) => void;
}
