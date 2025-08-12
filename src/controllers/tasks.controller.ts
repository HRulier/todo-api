import { Response } from "express";
import HTTP_STATUS from "~/utils/http_status";
import { NotFoundError, handleError } from "~/utils/errors";
import { isValid } from "date-fns";
import {
  ITaskController,
  CreateTaskInput,
  UpdateTaskInput,
} from "~/types/task";
import { IAuthentificateRequest } from "~/types/auth";
import { IUser } from "~/types/users";
import Task from "~/models/task";
import { FilterQuery } from "mongoose";

const NotFound = new NotFoundError("The requested task(s) was not found");

const populateTask = [
  {
    path: "tags",
    select: "_id label color",
  },
];

async function getTasks(req: IAuthentificateRequest, res: Response) {
  try {
    let { completed, minDate, maxDate } = req.query;
    const user = req.user as IUser;

    const query: FilterQuery<{
      user: string;
      minDate: string;
      maxDate: string;
      completed: string;
    }> = { user: user._id };

    // Any string is considered as "true" except for explicit value "false"
    if (typeof completed === "string") {
      query.completed = !(completed === "false");
    }

    const parsedMinDate =
      typeof minDate === "string" ? new Date(minDate) : null;
    const parsedMaxDate =
      typeof maxDate === "string" ? new Date(maxDate) : null;

    const isMaxDateValid = parsedMaxDate && isValid(parsedMaxDate);
    const isMinDateValid = parsedMinDate && isValid(parsedMinDate);

    if (isMinDateValid || isMaxDateValid) {
      query.dueDate = {};
      if (isMinDateValid) query.dueDate.$gte = parsedMinDate;
      if (isMaxDateValid) query.dueDate.$lte = parsedMaxDate;
    }

    const tasks = await Task.find(query).populate(populateTask);

    return res.status(HTTP_STATUS.OK).json({ tasks });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function getTaskById(req: IAuthentificateRequest, res: Response) {
  try {
    const user = req.user as IUser;
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, user: user._id }).populate(
      populateTask
    );

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
    let { position = 1024, dueDate, tags = [] } = createData;

    if (position === 1024) {
      const minPositionTask = await Task.findOne({
        user: user._id,
        dueDate,
      }).sort({ position: 1 });

      if (minPositionTask) position = minPositionTask.position - 1;
    }

    const task = new Task({
      ...createData,
      user: user._id,
      position,
      tags,
    });
    await task.save();

    await Task.populate(task, populateTask);

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
    ).populate(populateTask);

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
