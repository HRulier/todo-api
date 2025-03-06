import { Response } from "express";
import { NotFoundError, CustomError, handleError } from "~/utils/errors";
import { ITodo, ITodoController } from "~/types/todo";
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
    const { description, date } = req.body;
    if (!description) {
      throw new CustomError("Can't create todo : missing field(s)");
    }

    const todo = new Todo({
      description,
      date,
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
    const { description, date, completed } = req.body;

    const updatedProperties: Partial<
      Pick<ITodo, "description" | "date" | "completed">
    > = {
      description,
      date,
      completed,
    };

    // Clean property equel to undefined
    Object.keys(updatedProperties).forEach((key) => {
      const typedKey = key as keyof typeof updatedProperties;
      if (updatedProperties[typedKey] === undefined) {
        delete updatedProperties[typedKey];
      }
    });

    const todo = await Todo.findOneAndUpdate(
      { _id: id, user: user._id },
      updatedProperties,
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
