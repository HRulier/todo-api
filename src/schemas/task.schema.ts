import registry from "~/openapi/registry";
import z from "~/utils/zod/zod-extended";
import { getErrorSchema } from "./error.schema";

const TaskSchema = z.object({
  _id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")
    .openapi({
      example: "67c5c2e9656ca8c7f95f7d52",
    }),
  description: z.string().openapi({ example: "Lorem ipsum dolor sit amet" }),
  date: z.coerce.date().openapi({ example: "2025-03-03T14:55:26.078Z" }),
  completed: z.boolean().default(false).openapi({ example: false }),
  user: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")
    .openapi({
      example: "67c5c2e9656ca8c7f95f7d52",
    }),
  createdAt: z.coerce.date().openapi({ example: "2025-03-03T14:55:37.403Z" }),
  updatedAt: z.coerce.date().openapi({ example: "2025-03-03T14:55:37.403Z" }),
});

const CreateTaskSchema = z.object({
  date: z.coerce.date().openapi({ example: "2025-03-03T14:55:37.403Z" }),
  description: z.string().openapi({ example: "Lorem ipsum dolor sit amet" }),
});

// Set fields as optional for update
const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  completed: z.boolean().default(false).openapi({ example: true }),
});

const TaskNotFoundSchema = getErrorSchema(
  "error",
  "The requested task(s) was not found"
);

registry.register("Task", TaskSchema);
registry.register("CreateTaskSchema", CreateTaskSchema);
registry.register("UpdateTaskSchema", UpdateTaskSchema);

export { TaskSchema, CreateTaskSchema, UpdateTaskSchema, TaskNotFoundSchema };
