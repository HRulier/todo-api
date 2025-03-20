import z from "~/utils/zod/zod-extended";
import { generateZodValidationErrorExample } from "~/utils/zod/zod-error-generator";
import {
  RegisterUserSchema,
  LoginUserSchema,
  UserNotFoundSchema,
  UpdateUserProfileSchema,
  UserSchema,
} from "~/schemas/user.schema";
import { getErrorSchema } from "~/schemas/error.schema";
import { getErrorResponseConfig } from "../utils";

// -------------------------------------
// Invalid Data
// --------------------------------------

const invalidRegisterDataExample = {
  email: "test",
  password: "test!test432",
  profile: {
    firstName: "test",
    lastName: "test",
  },
};

const invalidLoginDataExample = {
  email: "test",
  password: "test!test432",
};

const invalidForgotPasswordDataExample = {
  email: "test",
};

const invalidResetPasswordDataExample = {
  pwd: "test",
};

// -------------------------------------
// Generated Validation errors
// -------------------------------------

const invalidupdateProfileDataExample = { profile: { firstName: null } };

const registerValidationExample = generateZodValidationErrorExample(
  RegisterUserSchema,
  invalidRegisterDataExample
);

const loginValidationExample = generateZodValidationErrorExample(
  LoginUserSchema,
  invalidLoginDataExample
);

const refreshTokenValidationExample = generateZodValidationErrorExample(
  z.object({ refreshToken: z.string() }),
  { refreshToken: null }
);

const updateProfileValidationExample = generateZodValidationErrorExample(
  UpdateUserProfileSchema,
  invalidupdateProfileDataExample
);

const forgotPasswordValidationExample = generateZodValidationErrorExample(
  UserSchema.pick({ email: true }),
  invalidForgotPasswordDataExample
);

const resetPasswordValidationExample = generateZodValidationErrorExample(
  UserSchema.pick({ password: true }),
  invalidResetPasswordDataExample
);

// -------------------------------------
// Error config. responses
// -------------------------------------

const userNotFoundResponse = getErrorResponseConfig(
  "User not found",
  UserNotFoundSchema
);

const credentialsNotVerifiedResponse = getErrorResponseConfig(
  "Unauthorized",
  getErrorSchema(
    "error",
    "Your login details could not be verified. Please try again."
  )
);

const invalidRefreshTokenResponse = getErrorResponseConfig(
  "Access denied - invalid fields",
  getErrorSchema("error", "Invalid Refresh Token")
);

const userNotFoundForgotPasswordResponse = getErrorResponseConfig(
  "User not found",
  getErrorSchema("error", "Can't find user for this email")
);

const resetTokenTokenExpiredResponse = getErrorResponseConfig(
  "Invalid token. The password reset token is either expired, invalid.",
  getErrorSchema("error", "Password reset token is invalid or has expired.")
);

export {
  // Validation errors
  registerValidationExample,
  loginValidationExample,
  refreshTokenValidationExample,
  updateProfileValidationExample,
  forgotPasswordValidationExample,
  resetPasswordValidationExample,
  // Error responses
  userNotFoundResponse,
  credentialsNotVerifiedResponse,
  invalidRefreshTokenResponse,
  userNotFoundForgotPasswordResponse,
  resetTokenTokenExpiredResponse,
};
