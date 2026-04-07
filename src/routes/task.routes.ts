import { Router } from "express";
import TaskController from "~/controllers/tasks.controller";
import { requireAuth } from "~/middlewares/auth.handler";
import validateRequest from "~/middlewares/validateRequest.handler";
import verifyApiKey from "~/middlewares/verifyApiKey.handler";
import IdSchema from "~/schemas/id.schema";
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  GetTasksQuerySchema,
  CreateTasksWithUserSchema,
} from "~/schemas/task.schema";

const tasksRoutes = Router();

tasksRoutes.get(
  "/",
  requireAuth,
  validateRequest({
    query: GetTasksQuerySchema,
  }),
  TaskController.getTasks
);

tasksRoutes.get(
  "/:id",
  requireAuth,
  validateRequest({
    params: IdSchema,
  }),
  TaskController.getTaskById
);

tasksRoutes.post(
  "/",
  requireAuth,
  validateRequest({ body: CreateTaskSchema }),
  TaskController.createTask
);

tasksRoutes.post(
  "/bulk",
  validateRequest({
    body: CreateTasksWithUserSchema,
  }),
  verifyApiKey,
  TaskController.createTasks
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
