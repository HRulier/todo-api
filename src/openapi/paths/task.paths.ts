import registry from "../registry";
import z from "~/utils/zod/zod-extended";
import HTTP_STATUS from "~/utils/http_status";
import {
  TaskSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
} from "~/schemas/task.schema";
import {
  taskNotFoundResponse,
  taskIdValidationExample,
  taskValidationExample,
  getTasksValidationExample,
} from "../examples/task.examples";
import { ErrorSchema } from "~/schemas/error.schema";
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
    parameters: [
      {
        name: "completed",
        in: "query",
        description: "Filter tasks by completion status",
        required: false,
        schema: {
          type: "string",
          enum: ["true", "false"],
          example: "true",
        },
      },
      {
        name: "minDate",
        in: "query",
        description:
          "Filter tasks from this date (inclusive). Format: ISO 8601 with 'Z' suffix",
        required: false,
      },
      {
        name: "maxDate",
        in: "query",
        description:
          "Filter tasks until this date (inclusive). Format: ISO 8601 with 'Z' suffix",
        required: false,
      },
    ],
    responses: {
      [HTTP_STATUS.OK]: {
        description: "List of tasks",
        content: {
          "application/json": {
            schema: z.object({
              tasks: z.array(TaskSchema),
            }),
          },
        },
      },
      [HTTP_STATUS.BAD_REQUEST]: {
        description: "Validation error - Invalid query params",
        content: {
          "application/json": {
            schema: ErrorSchema,
            example: getTasksValidationExample,
          },
        },
      },
      [HTTP_STATUS.UNAUTHORIZED]: unauthorizedResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
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
      [HTTP_STATUS.OK]: {
        description: "Get todo successfully",
        content: {
          "application/json": {
            schema: z.object({ task: TaskSchema }),
          },
        },
      },
      [HTTP_STATUS.BAD_REQUEST]: {
        description: "Validation error - Invalid MongoDB ID",
        content: {
          "application/json": {
            schema: ErrorSchema,
            example: taskIdValidationExample,
          },
        },
      },
      [HTTP_STATUS.NOT_FOUND]: taskNotFoundResponse,
      [HTTP_STATUS.UNAUTHORIZED]: unauthorizedResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
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
      [HTTP_STATUS.CREATED]: {
        description: "Task created successfully",
        content: {
          "application/json": {
            schema: z.object({ task: TaskSchema }),
          },
        },
      },
      [HTTP_STATUS.BAD_REQUEST]: {
        description: "Validation error - missing or invalid fields",
        content: {
          "application/json": {
            schema: ErrorSchema,
            example: taskValidationExample,
          },
        },
      },
      [HTTP_STATUS.UNAUTHORIZED]: unauthorizedResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
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
      [HTTP_STATUS.OK]: {
        description: "Task updated successfully",
        content: {
          "application/json": {
            schema: z.object({ task: TaskSchema }),
          },
        },
      },
      [HTTP_STATUS.BAD_REQUEST]: {
        description: "Validation error - missing or invalid fields",
        content: {
          "application/json": {
            schema: ErrorSchema,
            example: taskValidationExample,
          },
        },
      },
      [HTTP_STATUS.NOT_FOUND]: taskNotFoundResponse,
      [HTTP_STATUS.UNAUTHORIZED]: unauthorizedResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
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
      [HTTP_STATUS.OK]: {
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
      [HTTP_STATUS.BAD_REQUEST]: {
        description: "Validation error - Invalid MongoDB ID",
        content: {
          "application/json": {
            schema: ErrorSchema,
            example: taskIdValidationExample,
          },
        },
      },
      [HTTP_STATUS.NOT_FOUND]: taskNotFoundResponse,
      [HTTP_STATUS.UNAUTHORIZED]: unauthorizedResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
    },
  });
};
