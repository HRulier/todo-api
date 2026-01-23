import registry from "~/openapi/registry";
import z from "~/utils/zod/zod-extended";
import { TagSchema } from "./tag.schema";

const utcDateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
    "Date must be in UTC format (ISO 8601 with 'Z' suffix)",
  )
  .refine((dateStr: string) => !isNaN(new Date(dateStr).getTime()), {
    message: "Date must be valid",
  });

//* Use as response schema for GET POST PUT /tasks
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
  priority: z.string().default("low").openapi({ example: "low" }),
  user: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")
    .openapi({
      example: "67c5c2e9656ca8c7f95f7d52",
    }),
  tags: z.array(TagSchema.pick({ _id: true, label: true, color: true })),
  createdAt: z.coerce.date().openapi({ example: "2025-03-03T14:55:37.403Z" }),
  updatedAt: z.coerce.date().openapi({ example: "2025-03-03T14:55:37.403Z" }),
});

const GetTasksQuerySchema = z.object({
  minDate: utcDateSchema
    .nullish()
    .openapi({ example: "2025-08-10T22:00:00.000Z" }),
  maxDate: utcDateSchema
    .nullish()
    .openapi({ example: "2025-08-16T22:00:00.000Z" }),
  // completed: z.coerce.boolean().optional().openapi({ example: false }),
  completed: z.string().nullish().openapi({ example: "false" }),
});

const CreateTaskSchema = z.object({
  dueDate: z.coerce.date().openapi({ example: "2025-03-03T14:55:37.403Z" }),
  position: z.number().nullish().openapi({ example: 1024 }),
  priority: z.string().nullish().openapi({ example: "low" }),
  description: z.string().openapi({ example: "Lorem ipsum dolor sit amet" }),
  tags: z
    .array(z.string())
    .nullish()
    .openapi({
      example: ["67c5c2e9656ca8c7f95f7d52", "67c5c2e9656ca8c7f95f7d60"],
    }),
});

const CreateTasksWithUserSchema = z.object({
  user: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")
    .openapi({
      example: "67c5c2e9656ca8c7f95f7d52",
    }),
  tasks: z.array(CreateTaskSchema),
});
// Set fields as optional for update
const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  completed: z.boolean().default(false).openapi({ example: true }),
});

registry.register("Task", TaskSchema);

export {
  TaskSchema,
  CreateTaskSchema,
  CreateTasksWithUserSchema,
  UpdateTaskSchema,
  GetTasksQuerySchema,
};
