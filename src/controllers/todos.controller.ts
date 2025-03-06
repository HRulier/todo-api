import { Response } from "express";
import { NotFoundError, handleError } from "~/utils/errors";
import {
  ITodoController,
  CreateTodoInput,
  UpdateTodoInput,
} from "~/types/todo";
import { IAuthentificateRequest } from "~/types/auth";
import { IUser } from "~/types/users";
import Todo from "~/models/todo";

const NotFound = new NotFoundError("The requested todo(s) was not found");

async function getTodos(req: IAuthentificateRequest, res: Response) {
  try {
    const user = req.user as IUser;
    const todos = await Todo.find({ user: user._id });

    if (!todos.length) {
      throw NotFound;
    }

    return res.status(200).json({ todos });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function getTodoById(req: IAuthentificateRequest, res: Response) {
  try {
    const user = req.user as IUser;
    const { id } = req.params;
    const todo = await Todo.findOne({ _id: id, user: user._id });

    if (!todo) {
      throw NotFound;
    }

    return res.status(200).json({ todo });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function createTodo(req: IAuthentificateRequest, res: Response) {
  try {
    const user = req.user as IUser;
    const createData: CreateTodoInput = req.body;

    const todo = new Todo({
      ...createData,
      user: user._id,
    });
    await todo.save();

    return res.status(201).json({ todo });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function updateTodo(req: IAuthentificateRequest, res: Response) {
  try {
    const user = req.user as IUser;
    const { id } = req.params;
    const updateData: UpdateTodoInput = req.body;

    const todo = await Todo.findOneAndUpdate(
      { _id: id, user: user._id },
      updateData,
      {
        new: true,
      }
    );

    if (!todo) {
      throw NotFound;
    }

    return res.status(200).json({ todo });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function deleteTodo(req: IAuthentificateRequest, res: Response) {
  try {
    const user = req.user as IUser;
    const { id } = req.params;
    const todo = await Todo.findOneAndDelete({ _id: id, user: user._id });
    if (!todo) {
      throw NotFound;
    }
    return res.status(200).json({ message: "Todo successfully removed" });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

const TodoController: ITodoController = {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
};

export default TodoController;
