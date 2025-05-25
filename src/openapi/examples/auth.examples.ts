import z from "~/utils/zod/zod-extended";
import { generateZodValidationErrorExample } from "~/utils/zod/zod-error-generator";
import {
  RegisterUserSchema,
  LoginUserSchema,
  UpdateUserProfileSchema,
  UserSchema,
} from "~/schemas/user.schema";
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

const invalidUpdateProfileDataExample = { profile: { firstName: null } };

// -------------------------------------
// Generated Validation errors
// -------------------------------------

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
  invalidUpdateProfileDataExample
);

const invalidEmailValidationExample = generateZodValidationErrorExample(
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

const userNotFoundResponse = getErrorResponseConfig("User not found", {
  status: "error",
  message: "The requested user was not found",
  errors: [],
});

const credentialsNotVerifiedResponse = getErrorResponseConfig("Unauthorized", {
  status: "error",
  message: "Your login details could not be verified. Please try again.",
  errors: [],
});

const invalidRefreshTokenResponse = getErrorResponseConfig(
  "Access denied - invalid fields",
  {
    status: "error",
    message: "Invalid Refresh Token",
    errors: [],
  }
);

const userNotFoundForgotPasswordResponse = getErrorResponseConfig(
  "User not found",
  {
    status: "error",
    message: "Can't find user for this email",
    errors: [],
  }
);

const resetTokenExpiredResponse = getErrorResponseConfig(
  "Invalid token. The password reset token is either expired, invalid.",
  {
    status: "error",
    message: "Password reset token is invalid or has expired.",
    errors: [],
  }
);

const userAlreadyVerifiedExample = getErrorResponseConfig(
  "User account has already been verified.",
  {
    status: "error",
    message: "This account has already been verified.",
    errors: [],
  }
);

export {
  // Validation errors
  registerValidationExample,
  loginValidationExample,
  refreshTokenValidationExample,
  updateProfileValidationExample,
  invalidEmailValidationExample,
  resetPasswordValidationExample,
  // Error responses
  userNotFoundResponse,
  credentialsNotVerifiedResponse,
  invalidRefreshTokenResponse,
  userNotFoundForgotPasswordResponse,
  resetTokenExpiredResponse,
  userAlreadyVerifiedExample,
};
