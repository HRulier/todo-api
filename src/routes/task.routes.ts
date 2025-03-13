import { Router } from "express";
import TaskController from "~/controllers/tasks.controller";
import { requireAuth } from "~/middlewares/auth.handler";
import validateRequest from "~/middlewares/validateRequest.handler";
import idSchema from "~/schemas/id.schema";
import { createTaskSchema, updateTaskSchema } from "~/schemas/task.schema";

const tasksRoutes = Router();

tasksRoutes.get("/", requireAuth, TaskController.getTasks);

tasksRoutes.get(
  "/:id",
  requireAuth,
  validateRequest(idSchema, { source: "params" }),
  TaskController.getTaskById
);

tasksRoutes.post(
  "/",
  requireAuth,
  validateRequest(createTaskSchema),
  TaskController.createTask
);

tasksRoutes.put(
  "/:id",
  requireAuth,
  validateRequest(idSchema, { source: "params" }),
  validateRequest(updateTaskSchema),
  TaskController.updateTask
);

tasksRoutes.delete(
  "/:id",
  requireAuth,
  validateRequest(idSchema, { source: "params" }),
  TaskController.deleteTask
);

export default tasksRoutes;
