import { z } from "zod";

export const createTaskSchema = z.object({
  date: z.coerce.date(),
  description: z.string(),
  completed: z.boolean().default(false),
});

// Set fields as optional for update
export const updateTaskSchema = createTaskSchema.partial();
