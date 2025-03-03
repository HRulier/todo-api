import { Router } from "express";
import passport from "passport";
import TodoController from "~/controllers/todos.controller";

const todosRoutes = Router();

const requireAuth = passport.authenticate("jwt", {
  session: false,
});

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get all todos
 *     description: Get all todos for the authenticated user
 *     tags:
 *       - Todos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Get todos successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Error todo(s) not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "The requested todo(s) was not found"
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */

todosRoutes.get("/", requireAuth, TodoController.getTodos);

/**
 * @swagger
 * /api/todos/{todoId}:
 *   get:
 *     summary: Get one todo by Id
 *     description: Get one todo by Id for the authenticated user
 *     parameters:
 *       - in: path
 *         name: todoId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the todo to get
 *     tags:
 *       - Todos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Get todo successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Error todo(s) not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "The requested todo(s) was not found"
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */

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
 *             $ref: '#/components/schemas/TodoInputCreate'
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
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
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */

todosRoutes.post("/", requireAuth, TodoController.createTodo);

/**
 * @swagger
 * /api/todos/{todoId}:
 *   put:
 *     summary: Update a todo
 *     description: Update a todo item for the authenticated user
 *     parameters:
 *       - in: path
 *         name: todoId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the todo to delete
 *     tags:
 *       - Todos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TodoInputUpdate'
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Error todo(s) not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "The requested todo(s) was not found"
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */

todosRoutes.put("/:id", requireAuth, TodoController.updateTodo);

/**
 * @swagger
 * /api/todos/{todoId}:
 *   delete:
 *     summary: Delete one todo by Id
 *     description: Delete one todo by Id for the authenticated user
 *     parameters:
 *       - in: path
 *         name: todoId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the todo to delete
 *     tags:
 *       - Todos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Get todo removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Todo successfully removed"
 *       404:
 *         description: Error todo(s) not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "The requested todo(s) was not found"
 *       401:
 *         description: Unauthorized - user not authenticated
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */

todosRoutes.delete("/:id", requireAuth, TodoController.deleteTodo);

export default todosRoutes;
