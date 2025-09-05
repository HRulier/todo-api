import { Response, Request } from "express";
import HTTP_STATUS from "~/utils/http_status";
import { CustomError, NotFoundError } from "~/utils/errors";
import { handleError } from "~/utils/errors";
import { IOperationController } from "~/types/operation";
import User from "~/models/user";
import { CreateTaskSchema } from "~/schemas/task.schema";
import { createTasks } from "~/services/tasks.service";
import Operation from "~/models/operation";
import { ZodError } from "zod";

const NotFound = new NotFoundError(
  "The requested operation doest not exist or has already been executed"
);

async function createOperation(req: Request, res: Response) {
  try {
    const { user, source, type, payload, metadata } = req.body;

    let userId: string | null = null;

    if (user && source === "slack") {
      const slackUser = await User.findOne({ slackId: user.id });
      userId = slackUser?._id || null;
    }

    if (!userId) {
      throw new CustomError("User not found", HTTP_STATUS.BAD_REQUEST);
    }

    const operation = new Operation({
      user: userId.toString(),
      source,
      type,
      payload,
      metadata: metadata || {},
    });

    // Validate tasks before saving
    if (type === "bulk_create_tasks") {
      const tasks = payload.tasks;

      let error = {
        ZodError: {},
        index: 0,
      };
      tasks.every((task: unknown, index: number) => {
        const validation = CreateTaskSchema.safeParse(task);
        if (!validation.success) {
          error.ZodError = validation.error;
          error.index = index;
        }
        return validation.success;
      });

      if (error.ZodError instanceof ZodError) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: "error",
          message: `Validation failed, tasks at index ${error.index}`,
          errors: error.ZodError.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        });
      }
    }

    await operation.save();

    return res.status(HTTP_STATUS.CREATED).json({ operation });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function updateAndExecuteOperation(req: Request, res: Response) {
  try {
    const { shortId } = req.params;
    const { status } = req.body;

    const operation = await Operation.findOne({ shortId, status: "pending" });

    if (!operation) {
      throw NotFound;
    }

    if (
      operation.status === "pending" &&
      operation.type === "bulk_create_tasks" &&
      status === "approved"
    ) {
      const newTasks = operation.payload.tasks.map((task: any) => ({
        ...task,
      }));

      await createTasks(newTasks, operation.user);
    }

    // find by status prevent to update an already executed operation
    const updatedOperation = await Operation.findOneAndUpdate(
      { shortId, status: "pending" },
      { status },
      { new: true }
    );

    return res.status(HTTP_STATUS.OK).json({ operation: updatedOperation });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

const OperationController: IOperationController = {
  createOperation,
  updateAndExecuteOperation,
};

export default OperationController;
