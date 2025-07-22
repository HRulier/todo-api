import { getErrorResponseConfig } from "~/openapi/utils";
import { generateZodValidationErrorExample } from "~/utils/zod/zod-error-generator";
import IdSchema from "~/schemas/id.schema";
import { CreateTaskSchema, GetTasksQuerySchema } from "~/schemas/task.schema";

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

const invalidGetTasksQueryExample = {
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

const getTasksValidationExample = generateZodValidationErrorExample(
  GetTasksQuerySchema,
  invalidGetTasksQueryExample
);

export {
  // Validation errors
  taskValidationExample,
  taskIdValidationExample,
  getTasksValidationExample,
  // Error responses
  taskNotFoundResponse,
};
