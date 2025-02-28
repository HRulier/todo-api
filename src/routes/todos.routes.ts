import { Router } from "express";
import passport from "passport";
import TodoController from "~/controllers/todos.controller";

const todosRoutes = Router();

const requireAuth = passport.authenticate("jwt", {
  session: false,
});

todosRoutes.get("/", requireAuth, TodoController.getTodos);
todosRoutes.get("/:id", requireAuth, TodoController.getTodoById);

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     description: Creates a new todo item for the authenticated user
 *     tags:
 *       - Todos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoInput'
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateTodoResponse'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Can't create todo : missing field(s)"
 *       401:
 *         description: Unauthorized - user not authenticated
 */

todosRoutes.post("/", requireAuth, TodoController.createTodo);
todosRoutes.put("/:id", requireAuth, TodoController.updateTodo);
todosRoutes.delete("/:id", requireAuth, TodoController.deleteTodo);

export default todosRoutes;
