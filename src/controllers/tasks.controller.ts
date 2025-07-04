import { Response } from "express";
import HTTP_STATUS from "~/utils/http_status";
import { NotFoundError, handleError } from "~/utils/errors";
import {
  ITaskController,
  CreateTaskInput,
  UpdateTaskInput,
} from "~/types/task";
import { IAuthentificateRequest } from "~/types/auth";
import { IUser } from "~/types/users";
import Task from "~/models/task";
import { QueryOptions } from "mongoose";

const NotFound = new NotFoundError("The requested task(s) was not found");

async function getTasks(req: IAuthentificateRequest, res: Response) {
  try {
    let { completed } = req.query;
    const user = req.user as IUser;

    const query: QueryOptions = { user: user._id };
    if (completed === "true") query.completed = true;

    const tasks = await Task.find(query);

    if (!tasks.length) {
      throw NotFound;
    }

    return res.status(HTTP_STATUS.OK).json({ tasks });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function getTaskById(req: IAuthentificateRequest, res: Response) {
  try {
    const user = req.user as IUser;
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, user: user._id });

    if (!task) {
      throw NotFound;
    }

    return res.status(HTTP_STATUS.OK).json({ task });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function createTask(req: IAuthentificateRequest, res: Response) {
  try {
    const user = req.user as IUser;
    const createData: CreateTaskInput = req.body;

    const task = new Task({
      ...createData,
      user: user._id,
    });
    await task.save();

    return res.status(HTTP_STATUS.CREATED).json({ task });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function updateTask(req: IAuthentificateRequest, res: Response) {
  try {
    const user = req.user as IUser;
    const { id } = req.params;
    const updateData: UpdateTaskInput = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: id, user: user._id },
      updateData,
      {
        new: true,
      }
    );

    if (!task) {
      throw NotFound;
    }

    return res.status(HTTP_STATUS.OK).json({ task });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function deleteTask(req: IAuthentificateRequest, res: Response) {
  try {
    const user = req.user as IUser;
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, user: user._id });
    if (!task) {
      throw NotFound;
    }
    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Task successfully removed" });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

const TaskController: ITaskController = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};

export default TaskController;
