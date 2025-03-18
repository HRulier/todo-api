import z from "~/utils/zod/zod-extended";

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  profile: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
});

export const updateUserProfileSchema = z.object({
  profile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }),
});
