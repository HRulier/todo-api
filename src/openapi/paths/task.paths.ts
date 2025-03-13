import registry from "../registry";
import z from "zod";
import {
  TaskSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
} from "~/schemas/task.schema";
import IdSchema from "~/schemas/id.schema";
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
    },
  });

  // GET /tasks/{id }
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
    },
  });
};
