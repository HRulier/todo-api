import z from "~/utils/zod/zod-extended";
import { ErrorSchema } from "~/schemas/error.schema";

// Types inferred
export type ErrorResponse = z.infer<typeof ErrorSchema>;
