import { Router } from "express";
import TodoController from "~/controllers/todos.controller";
import { requireAuth } from "~/middlewares/auth.handler";
import validateRequest from "~/middlewares/validateRequest.handler";
import idSchema from "~/schemas/id.schema";
import { createTodoSchema, updateTodoSchema } from "~/schemas/todo.schema";

const todosRoutes = Router();

todosRoutes.get("/", requireAuth, TodoController.getTodos);

todosRoutes.get(
  "/:id",
  requireAuth,
  validateRequest(idSchema, { source: "params" }),
  TodoController.getTodoById
);

todosRoutes.post(
  "/",
  requireAuth,
  validateRequest(createTodoSchema),
  TodoController.createTodo
);

todosRoutes.put(
  "/:id",
  requireAuth,
  validateRequest(idSchema, { source: "params" }),
  validateRequest(updateTodoSchema),
  TodoController.updateTodo
);

todosRoutes.delete(
  "/:id",
  requireAuth,
  validateRequest(idSchema, { source: "params" }),
  TodoController.deleteTodo
);

export default todosRoutes;
