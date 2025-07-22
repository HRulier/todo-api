import registry from "~/openapi/registry";
import z from "~/utils/zod/zod-extended";

const TaskSchema = z.object({
  _id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")
    .openapi({
      example: "67c5c2e9656ca8c7f95f7d52",
    }),
  description: z.string().openapi({ example: "Lorem ipsum dolor sit amet" }),
  dueDate: z.coerce.date().openapi({ example: "2025-03-03T14:55:26.078Z" }),
  completed: z.boolean().default(false).openapi({ example: false }),
  position: z.number().default(1024).openapi({ example: 1024 }),
  user: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")
    .openapi({
      example: "67c5c2e9656ca8c7f95f7d52",
    }),
  createdAt: z.coerce.date().openapi({ example: "2025-03-03T14:55:37.403Z" }),
  updatedAt: z.coerce.date().openapi({ example: "2025-03-03T14:55:37.403Z" }),
});

const GetTasksQuerySchema = z.object({
  minDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .nullish()
    .openapi({ example: "2025-07-03" }),
  maxDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .nullish()
    .openapi({ example: "2025-07-03" }),
  completed: z.string().nullish().openapi({ example: "false" }),
});

const CreateTaskSchema = z.object({
  dueDate: z.coerce.date().openapi({ example: "2025-03-03T14:55:37.403Z" }),
  position: z.number().nullish().openapi({ example: 1024 }),
  description: z.string().openapi({ example: "Lorem ipsum dolor sit amet" }),
});

// Set fields as optional for update
const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  completed: z.boolean().default(false).openapi({ example: true }),
});

registry.register("Task", TaskSchema);

export { TaskSchema, CreateTaskSchema, UpdateTaskSchema, GetTasksQuerySchema };
