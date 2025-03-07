import { z } from "zod";

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  profile: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
});
