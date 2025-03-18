import { getErrorResponseConfig } from "~/openapi/utils";
import { generateZodValidationErrorExample } from "~/utils/zod/zod-error-generator";
import IdSchema from "~/schemas/id.schema";
import { CreateTaskSchema, TaskNotFoundSchema } from "~/schemas/task.schema";

// Error responses config
const taskNotFoundResponse = getErrorResponseConfig(
  "Task not found",
  TaskNotFoundSchema
);

const invalidTaskExample = {
  description: 10,
  date: "date",
};

const taskValidationExample = generateZodValidationErrorExample(
  CreateTaskSchema,
  invalidTaskExample
);

const taskIdValidationExample = generateZodValidationErrorExample(IdSchema, {
  id: "invalid id",
});

export { taskNotFoundResponse, taskValidationExample, taskIdValidationExample };
