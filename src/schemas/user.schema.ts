import z from "~/utils/zod/zod-extended";
import registry from "~/openapi/registry";

const UserSchema = z.object({
  _id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")
    .openapi({
      example: "67c5c2e9656ca8c7f95f7d52",
    }),
  role: z.string().openapi({ example: "Member" }),
  timezone: z.string().openapi({ example: "Europe/Paris" }),
  googleId: z.number().nullable().openapi({ example: 78972475051234701234 }),
  slackId: z.string().nullable().openapi({ example: "Z15CFAS8BWW" }),
  isVerified: z.boolean().openapi({ example: false }),
  dailyEmailReminder: z.boolean().openapi({ example: false }),
  email: z.string().email().openapi({ example: "joe.smith@mail.fr" }),
  password: z.string().nullish().openapi({ example: "Test!abc432" }),
  profile: z.object({
    firstName: z.string().openapi({ example: "Joe" }),
    lastName: z.string().openapi({ example: "Smith" }),
  }),
  refreshToken: z
    .string()
    .nullable()
    .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXV..." }),
  resetPasswordToken: z
    .string()
    .nullable()
    .openapi({ example: "31c5b4228a8c0219d6aaeeb739f79dc..." }),
  refreshPasswordExpires: z
    .number()
    .nullish()
    .openapi({ example: 1747400873727 }),
  verificationToken: z
    .string()
    .nullable()
    .openapi({ example: "31c5b4228a8c0219d6aaeeb739f79dc..." }),
  verificationTokenExpires: z
    .number()
    .nullish()
    .openapi({ example: 1747400873727 }),
  createdAt: z.coerce.date().openapi({ example: "2025-03-03T14:55:37.403Z" }),
  updatedAt: z.coerce.date().openapi({ example: "2025-03-03T14:55:37.403Z" }),
});

const UserProfileSchema = UserSchema.pick({
  _id: true,
  email: true,
  profile: true,
});

const RegisterUserSchema = UserSchema.pick({
  email: true,
  password: true,
  profile: true,
  timezone: true,
});

const LoginUserSchema = UserSchema.pick({ email: true, password: true });

const UpdateUserProfileSchema = z.object({
  dailyEmailReminder: z.boolean().openapi({ example: false }),
  profile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }),
});

registry.register("User", UserSchema);
registry.register("UserProfileSchema", UserProfileSchema);

export {
  UserSchema,
  RegisterUserSchema,
  LoginUserSchema,
  UpdateUserProfileSchema,
  UserProfileSchema,
};
