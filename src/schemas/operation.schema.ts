import registry from "~/openapi/registry";
import z from "~/utils/zod/zod-extended";

const OperationSchema = z.object({
  _id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")
    .openapi({
      example: "67c5c2e9656ca8c7f95f7d52",
    }),
  user: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")
    .openapi({
      example: "67c5c2e9656ca8c7f95f7d52",
    }),
  shortId: z.string().openapi({
    example: "MFAFU856DVV",
  }),
  source: z.enum(["slack"]).openapi({
    example: "slack",
    description: "Source of the operation",
  }),
  status: z.enum(["pending", "approved", "rejected"]).openapi({
    example: "pending",
    description: "Current status of the operation",
  }),
  type: z.enum(["bulk_create_tasks"]).openapi({
    example: "bulk_create_tasks",
    description: "Type of operation to perform",
  }),
  payload: z.record(z.any()).openapi({
    example: {
      tasks: [
        {
          description: "Task 1",
          dueDate: "2025-07-18T14:55:37.403Z",
        },
        {
          description: "Task 2",
          dueDate: "2025-07-18T14:55:37.403Z",
        },
      ],
    },
    description: "Operation payload data",
  }),
  metadata: z
    .object({
      channel: z.string().nullable().openapi({
        example: "D09D3PD3RB8",
        description: "Channel where the operation was initiated",
      }),
      approvedBy: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")
        .nullable()
        .openapi({
          example: "67c5c2e9656ca8c7f95f7d52",
          description: "User ID who approved the operation",
        }),
      approvedAt: z.coerce.date().nullable().openapi({
        example: "2025-07-18T14:55:37.403Z",
        description: "Date when the operation was approved",
      }),
    })
    .openapi({ description: "Additional metadata for the operation" }),
  createdAt: z.coerce.date().openapi({ example: "2025-07-18T14:55:37.403Z" }),
  updatedAt: z.coerce.date().openapi({ example: "2025-07-18T14:55:37.403Z" }),
});

const CreateOperationSchema = z.object({
  user: z.string().nullable().openapi({
    example: "slack",
  }),
  source: z.enum(["slack"]).openapi({
    example: "slack",
    description: "Source of the operation",
  }),
  type: z.enum(["bulk_create_tasks"]).openapi({
    example: "bulk_create_tasks",
    description: "Type of operation to perform",
  }),
  payload: z.record(z.any()).openapi({
    example: {
      tasks: [
        {
          description: "Task 1",
          dueDate: "2025-07-18T14:55:37.403Z",
        },
        {
          description: "Task 2",
          dueDate: "2025-07-18T14:55:37.403Z",
        },
      ],
    },
    description: "Operation payload data",
  }),
  metadata: z
    .object({
      channel: z.string().nullable().optional().openapi({
        example: "D09D3PD3RB8",
        description: "Channel where the operation was initiated",
      }),
      approvedBy: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")
        .nullable()
        .optional()
        .openapi({
          example: "67c5c2e9656ca8c7f95f7d52",
          description: "User ID who approved the operation",
        }),
      approvedAt: z.coerce.date().nullable().optional().openapi({
        example: "2025-07-18T14:55:37.403Z",
        description: "Date when the operation was approved",
      }),
    })
    .optional()
    .openapi({ description: "Additional metadata for the operation" }),
});

registry.register("Operation", OperationSchema);
registry.register("CreateOperation", CreateOperationSchema);

export { OperationSchema, CreateOperationSchema };
