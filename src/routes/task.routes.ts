import { Router } from "express";
import TaskController from "~/controllers/tasks.controller";
import { requireAuth } from "~/middlewares/auth.handler";
import validateRequest from "~/middlewares/validateRequest.handler";
import IdSchema from "~/schemas/id.schema";
import { CreateTaskSchema, UpdateTaskSchema } from "~/schemas/task.schema";

const tasksRoutes = Router();

tasksRoutes.get("/", requireAuth, TaskController.getTasks);

tasksRoutes.get(
  "/:id",
  requireAuth,
  validateRequest({ params: IdSchema }),
  TaskController.getTaskById
);

tasksRoutes.post(
  "/",
  requireAuth,
  validateRequest({ body: CreateTaskSchema }),
  TaskController.createTask
);

tasksRoutes.put(
  "/:id",
  requireAuth,
  validateRequest({ params: IdSchema, body: UpdateTaskSchema }),
  TaskController.updateTask
);

tasksRoutes.delete(
  "/:id",
  requireAuth,
  validateRequest({ params: IdSchema }),
  TaskController.deleteTask
);

export default tasksRoutes;
