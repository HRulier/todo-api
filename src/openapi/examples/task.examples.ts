import { getErrorResponseConfig } from "~/openapi/utils";
import { generateZodValidationErrorExample } from "~/utils/zod/zod-error-generator";
import IdSchema from "~/schemas/id.schema";
import { CreateTaskSchema } from "~/schemas/task.schema";

// -------------------------------------
// Invalid Data
// --------------------------------------

const taskNotFoundResponse = getErrorResponseConfig("Task not found", {
  status: "error",
  message: "The requested task(s) was not found",
  errors: [],
});

const invalidTaskExample = {
  description: 10,
  dueDate: "date",
};

// -------------------------------------
// Generated Validation errors
// -------------------------------------

const taskValidationExample = generateZodValidationErrorExample(
  CreateTaskSchema,
  invalidTaskExample
);

const taskIdValidationExample = generateZodValidationErrorExample(IdSchema, {
  id: "invalid id",
});

export {
  // Validation errors
  taskValidationExample,
  taskIdValidationExample,
  // Error responses
  taskNotFoundResponse,
};
