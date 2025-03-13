import registry from "../registry";
import z from "zod";
import {
  TaskSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
} from "~/schemas/task.schema";
import { getErrorResponse } from "~/openapi/utils";
import IdSchema from "~/schemas/id.schema";

const notFoundResponse = getErrorResponse(
  "Task not found",
  "The requested task(s) was not found"
);

const unauthorizedResponse = getErrorResponse(
  "Unauthorized",
  "Invalid or expired token. Please log in again."
);

const internalServerResponse = getErrorResponse(
  "Internal server error",
  "InternalError"
);

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
      404: notFoundResponse,
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
      404: notFoundResponse,
      401: unauthorizedResponse,
      500: internalServerResponse,
    },
  });

  // POST /tasks
  registry.registerPath({
    method: "post",
    path: "/tasks",
    tags: ["Tasks"],
    summary: "Create a new ask for the authenticated user",
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
        description: "List of tasks",
        content: {
          "application/json": {
            schema: z.object({ task: TaskSchema }),
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
      404: notFoundResponse,
      401: unauthorizedResponse,
      500: internalServerResponse,
    },
  });

  // DELETE /tasks/{id}
  registry.registerPath({
    method: "delete",
    path: "/tasks/{id}",
    tags: ["Tasks"],
    summary: "Delete one todo by Id for the authenticated user",
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
      404: notFoundResponse,
      401: unauthorizedResponse,
      500: internalServerResponse,
    },
  });
};
