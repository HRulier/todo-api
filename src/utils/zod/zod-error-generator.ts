import { ZodType, ZodError } from "zod";

const generateZodValidationErrorExample = (
  schema: ZodType<any>,
  invalidData: Record<string, any>
) => {
  try {
    schema.parse(invalidData);

    console.warn(
      "No validation errors could be generated with the provided data"
    );
    return {
      status: "error",
      message: "Validation failed",
      errors: [
        {
          path: "field",
          message:
            "No validation errors could be generated with the provided data",
        },
      ],
    };
  } catch (error) {
    if (error instanceof ZodError) {
      // Format Zod errors
      return {
        status: "error",
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      };
    }

    // En cas d'autre type d'erreur
    return {
      status: "error",
      message: "Validation failed",
      errors: [
        {
          path: "unknown",
          message: "An unexpected error occurred",
        },
      ],
    };
  }
};

const generateMultipleErrorExamples = (
  schema: ZodType<any>,
  invalidDataCases: Record<string, Record<string, any>>
) => {
  const examples: Record<string, any> = {};

  for (const [caseName, invalidData] of Object.entries(invalidDataCases)) {
    examples[caseName] = generateZodValidationErrorExample(schema, invalidData);
  }

  return examples;
};

export { generateZodValidationErrorExample, generateMultipleErrorExamples };
