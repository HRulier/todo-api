import registry from "../registry";
import z from "~/utils/zod/zod-extended";
import {
  TaskSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
} from "~/schemas/task.schema";
import {
  taskNotFoundResponse,
  taskIdValidationExample,
  taskValidationExample,
} from "../examples/task.examples";
import { ValidationErrorSchema } from "~/schemas/error.schema";
import {
  unauthorizedResponse,
  internalServerResponse,
} from "~/openapi/examples/error.examples";
import IdSchema from "~/schemas/id.schema";

// Register paths
export const registerTaskPaths = () => {
  // GET /tasks
  registry.registerPath({
    method: "get",
    path: "/tasks",
    tags: ["Tasks"],
    summary: "Get all tasks for the authenticated user",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "List of tasks",
        content: {
          "application/json": {
            schema: z.object({
              tasks: z.array(TaskSchema),
            }),
          },
        },
      },
      404: taskNotFoundResponse,
      401: unauthorizedResponse,
      500: internalServerResponse,
    },
  });

  // GET /tasks/{id}
  registry.registerPath({
    method: "get",
    path: "/tasks/{id}",
    tags: ["Tasks"],
    summary: "Get one task by Id for the authenticated user",
    security: [{ bearerAuth: [] }],
    request: {
      params: IdSchema,
    },
    responses: {
      200: {
        description: "Get todo successfully",
        content: {
          "application/json": {
            schema: z.object({ task: TaskSchema }),
          },
        },
      },
      400: {
        description: "Validation error - Invalid MongoDB ID",
        content: {
          "application/json": {
            schema: ValidationErrorSchema,
            example: taskIdValidationExample,
          },
        },
      },
      404: taskNotFoundResponse,
      401: unauthorizedResponse,
      500: internalServerResponse,
    },
  });

  // POST /tasks
  registry.registerPath({
    method: "post",
    path: "/tasks",
    tags: ["Tasks"],
    summary: "Create a new task for the authenticated user",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: CreateTaskSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Task created successfully",
        content: {
          "application/json": {
            schema: z.object({ task: TaskSchema }),
          },
        },
      },
      400: {
        description: "Validation error - missing or invalid fields",
        content: {
          "application/json": {
            schema: ValidationErrorSchema,
            example: taskValidationExample,
          },
        },
      },
      401: unauthorizedResponse,
      500: internalServerResponse,
    },
  });

  // PUT /tasks/{id}
  registry.registerPath({
    method: "put",
    path: "/tasks/{id}",
    tags: ["Tasks"],
    summary: "Update a task for the authenticated user",
    security: [{ bearerAuth: [] }],
    request: {
      params: IdSchema,
      body: {
        content: {
          "application/json": {
            schema: UpdateTaskSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Task updated successfully",
        content: {
          "application/json": {
            schema: z.object({ task: TaskSchema }),
          },
        },
      },
      400: {
        description: "Validation error - missing or invalid fields",
        content: {
          "application/json": {
            schema: ValidationErrorSchema,
            example: taskValidationExample,
          },
        },
      },
      404: taskNotFoundResponse,
      401: unauthorizedResponse,
      500: internalServerResponse,
    },
  });

  // DELETE /tasks/{id}
  registry.registerPath({
    method: "delete",
    path: "/tasks/{id}",
    tags: ["Tasks"],
    summary: "Delete one task by Id for the authenticated user",
    security: [{ bearerAuth: [] }],
    request: {
      params: IdSchema,
    },
    responses: {
      200: {
        description: "Todo successfully removed",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({
                example: "Task successfully removed",
              }),
            }),
          },
        },
      },
      400: {
        description: "Validation error - Invalid MongoDB ID",
        content: {
          "application/json": {
            schema: ValidationErrorSchema,
            example: taskIdValidationExample,
          },
        },
      },
      404: taskNotFoundResponse,
      401: unauthorizedResponse,
      500: internalServerResponse,
    },
  });
};
