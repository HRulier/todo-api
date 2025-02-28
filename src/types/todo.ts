import { Response } from "express";
import { Document } from "mongoose";
import { IUser } from "./users";
import { IAuthentificateRequest } from "./auth";

export interface ITodo extends Document {
  _id: string;
  date: Date;
  description: string;
  done: boolean;
  user: IUser;
}

export interface ITodoController {
  getTodos: (req: IAuthentificateRequest, res: Response) => Promise<Response>;
  getTodoById: (
    req: IAuthentificateRequest,
    res: Response
  ) => Promise<Response>;
  createTodo: (req: IAuthentificateRequest, res: Response) => Promise<Response>;
  updateTodo: (req: IAuthentificateRequest, res: Response) => Promise<Response>;
  deleteTodo: (req: IAuthentificateRequest, res: Response) => Promise<Response>;
}
