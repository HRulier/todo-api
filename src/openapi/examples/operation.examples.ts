import { generateZodValidationErrorExample } from "~/utils/zod/zod-error-generator";
import { CreateOperationSchema } from "~/schemas/operation.schema";

// -------------------------------------
// Invalid Data
// --------------------------------------
const invalidOperationExample = {
  source: "chat",
  user: "U09DRSE6HDW",
  type: "bulk_create_tasks",
  payload: {
    tasks: [
      {
        description: "Review quarterly sales report",
        dueDate: "2025-09-05T09:00:00.000Z",
      },
      {
        description: "Schedule team meeting",
        dueDate: "2025-09-05T16:00:00.000Z",
      },
      {
        description: "Update project documentation",
        dueDate: "2025-09-06T10:00:00.000Z",
      },
    ],
  },
  metadata: {
    channel: "D09D3PD3RB8",
  },
};
// -------------------------------------
// Generated Validation errors
// -------------------------------------

const operationValidationExample = generateZodValidationErrorExample(
  CreateOperationSchema,
  invalidOperationExample
);

export {
  // Validation errors
  operationValidationExample,
};
