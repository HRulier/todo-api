import { getErrorResponseConfig } from "~/openapi/utils";
import { generateZodValidationErrorExample } from "~/utils/zod/zod-error-generator";
import { CreateTagSchema } from "~/schemas/tag.schema";

// -------------------------------------
// Invalid Data
// --------------------------------------

const tagNotFoundResponse = getErrorResponseConfig("Tag not found", {
  status: "error",
  message: "The requested tag(s) was not found",
  errors: [],
});

const invalidTagExample = {
  label: 100,
};

// -------------------------------------
// Generated Validation errors
// -------------------------------------

const tagValidationExample = generateZodValidationErrorExample(
  CreateTagSchema,
  invalidTagExample
);

export {
  // Validation errors
  tagValidationExample,
  // Error responses
  tagNotFoundResponse,
};