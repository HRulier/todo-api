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
  email: z.string().email().openapi({ example: "joe.smith@mail.fr" }),
  password: z.string().openapi({ example: "Test!abc432" }),
  profile: z.object({
    firstName: z.string().openapi({ example: "Joe" }),
    lastName: z.string().openapi({ example: "Smith" }),
  }),
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
});

const LoginUserSchema = UserSchema.pick({ email: true, password: true });

const UpdateUserProfileSchema = z.object({
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
