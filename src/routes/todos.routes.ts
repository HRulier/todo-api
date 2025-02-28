import { Router } from "express";
import passport from "passport";
import TodoController from "~/controllers/todos.controller";

const todosRoutes = Router();

const requireAuth = passport.authenticate("jwt", {
  session: false,
});

todosRoutes.get("/", requireAuth, TodoController.getTodos);
todosRoutes.get("/:id", requireAuth, TodoController.getTodoById);
todosRoutes.post("/", requireAuth, TodoController.createTodo);
todosRoutes.put("/:id", requireAuth, TodoController.updateTodo);
todosRoutes.delete("/:id", requireAuth, TodoController.deleteTodo);

export default todosRoutes;
