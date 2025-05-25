import z from "~/utils/zod/zod-extended";
import registry from "~/openapi/registry";
import HTTP_STATUS from "~/utils/http_status";
import {
  UserSchema,
  RegisterUserSchema,
  LoginUserSchema,
  UpdateUserProfileSchema,
  UserProfileSchema,
} from "~/schemas/user.schema";
import {
  registerValidationExample,
  loginValidationExample,
  refreshTokenValidationExample,
  updateProfileValidationExample,
  invalidEmailValidationExample,
  resetPasswordValidationExample,
  userNotFoundResponse,
  credentialsNotVerifiedResponse,
  invalidRefreshTokenResponse,
  userNotFoundForgotPasswordResponse,
  resetTokenExpiredResponse,
  userAlreadyVerifiedExample,
} from "~/openapi/examples/auth.examples";
import {
  unauthorizedResponse,
  internalServerResponse,
} from "~/openapi/examples/error.examples";
import { ErrorSchema } from "~/schemas/error.schema";

// Register paths
export const registerAuthPaths = () => {
  // POST /auth/login
  registry.registerPath({
    method: "post",
    path: "/auth/login",
    tags: ["Authentication"],
    summary: "User login",
    description:
      "Authenticates the user with their email and password, and returns a JWT token for further API requests.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: LoginUserSchema,
          },
        },
      },
    },
    responses: {
      [HTTP_STATUS.OK]: {
        description: "Login successful, returns a JWT token and user info",
        content: {
          "application/json": {
            schema: z.object({
              token: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIs..." }),
              user: UserProfileSchema,
            }),
          },
        },
      },
      [HTTP_STATUS.BAD_REQUEST]: {
        description: "Validation error - missing or invalid fields",
        content: {
          "application/json": {
            schema: ErrorSchema,
            example: loginValidationExample,
          },
        },
      },
      [HTTP_STATUS.UNAUTHORIZED]: credentialsNotVerifiedResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
    },
  });

  // POST /auth/register
  registry.registerPath({
    method: "post",
    path: "/auth/register",
    tags: ["Authentication"],
    summary: "Register a new user",
    description: "Creates a new user account and returns a JWT token",
    request: {
      body: {
        content: {
          "application/json": {
            schema: RegisterUserSchema,
          },
        },
      },
    },
    responses: {
      [HTTP_STATUS.CREATED]: {
        description: "User registered successfully",
        content: {
          "application/json": {
            schema: z.object({
              user: UserSchema.pick({ _id: true, email: true }),
            }),
          },
        },
      },
      [HTTP_STATUS.BAD_REQUEST]: {
        description: "Validation error - missing or invalid fields",
        content: {
          "application/json": {
            schema: ErrorSchema,
            example: registerValidationExample,
          },
        },
      },
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
    },
  });

  // POST /auth/refresh-token
  registry.registerPath({
    method: "post",
    path: "/auth/refresh-token",
    tags: ["Authentication"],
    summary: "Obtain a new access token using a refresh token",
    description:
      "Use a refresh token to obtain a new access token when user token has expired.",
    request: {
      cookies: z.object({
        refreshToken: z
          .string()
          .openapi({ example: "eyJhbGciOiJIUzI1NiIs..." }),
      }),
    },
    responses: {
      [HTTP_STATUS.OK]: {
        description: "Refresh token successful, returns a new JWT token",
        content: {
          "application/json": {
            schema: z.object({
              token: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIs..." }),
            }),
          },
        },
      },
      [HTTP_STATUS.BAD_REQUEST]: {
        description: "Bad request - Validation error",
        content: {
          "application/json": {
            schema: ErrorSchema,
            example: refreshTokenValidationExample,
          },
        },
      },
      [HTTP_STATUS.FORBIDDEN]: invalidRefreshTokenResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
    },
  });

  // POST /auth/forgot-password
  registry.registerPath({
    method: "post",
    path: "/auth/forgot-password",
    tags: ["Authentication"],
    summary: "Forgot password",
    description:
      "Initiates a password reset process by sending a password reset link to the user's email address, if the email is registered in the system.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: UserSchema.pick({ email: true }),
          },
        },
      },
    },
    responses: {
      [HTTP_STATUS.OK]: {
        description:
          "Password reset email sent successfully. A link to reset the password has been sent to the user's email address.",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({
                example:
                  "Please check your email for the link to reset your password.",
              }),
            }),
          },
        },
      },
      [HTTP_STATUS.BAD_REQUEST]: {
        description: "Bad request - Validation error",
        content: {
          "application/json": {
            schema: ErrorSchema,
            example: invalidEmailValidationExample,
          },
        },
      },
      [HTTP_STATUS.NOT_FOUND]: userNotFoundForgotPasswordResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
    },
  });

  // POST /auth/reset-password
  registry.registerPath({
    method: "post",
    path: "/auth/reset-password/{token}",
    tags: ["Authentication"],
    summary: "Reset password",
    description:
      "Resets the user's password using a valid password reset token and a new password provided by the user. The token is usually sent to the user's email after they request a password reset.",
    request: {
      params: z.object({
        token: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIs..." }),
      }),
      body: {
        content: {
          "application/json": {
            schema: UserSchema.pick({ password: true }),
          },
        },
      },
    },
    responses: {
      [HTTP_STATUS.OK]: {
        description:
          "Password reset successful. The user's password has been successfully updated and can now be used for login.",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({
                example: "Your password has been changed.",
              }),
            }),
          },
        },
      },
      [HTTP_STATUS.BAD_REQUEST]: {
        description: "Bad request - Validation error",
        content: {
          "application/json": {
            schema: ErrorSchema,
            example: resetPasswordValidationExample,
          },
        },
      },
      [HTTP_STATUS.UNPROCESSABLE_ENTITY]: resetTokenExpiredResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
    },
  });

  // GET /auth/reset-password/redirect/:token
  registry.registerPath({
    method: "get",
    path: "/auth/reset-password/redirect/{token}",
    tags: ["Authentication"],
    summary: "Redirect user to reset password page",
    description:
      "Redirect user to reset password page and handle token validation. The token is usually sent to the user's email after they request a password reset.",
    request: {
      params: z.object({
        token: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIs..." }),
      }),
    },
    responses: {
      [HTTP_STATUS.OK]: {
        description:
          "Redirect user to /reset-password/:token page, if token expired to /reset-password (without token, mean token expired)",
      },
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
    },
  });

  // GET /auth/logout
  registry.registerPath({
    method: "get",
    path: "/auth/logout",
    tags: ["Authentication"],
    summary: "Remove refresh token",
    description: "Revokes the refresh token to prevent future token renewals",
    request: {
      cookies: z.object({
        refreshToken: z
          .string()
          .openapi({ example: "eyJhbGciOiJIUzI1NiIs..." }),
      }),
    },
    responses: {
      [HTTP_STATUS.OK]: {
        description: "Logout success",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Logout success" }),
            }),
          },
        },
      },
      [HTTP_STATUS.BAD_REQUEST]: {
        description: "Bad request - Validation error",
        content: {
          "application/json": {
            schema: ErrorSchema,
            example: refreshTokenValidationExample,
          },
        },
      },
      [HTTP_STATUS.NOT_FOUND]: userNotFoundResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
    },
  });

  // GET /auth/profile
  registry.registerPath({
    method: "get",
    path: "/auth/profile",
    tags: ["Authentication"],
    summary: "Get profile for the authenticated user",
    security: [{ bearerAuth: [] }],
    responses: {
      [HTTP_STATUS.OK]: {
        description: "Get profile for the authenticated user",
        content: {
          "application/json": {
            schema: z.object({ user: UserProfileSchema }),
          },
        },
      },
      [HTTP_STATUS.UNAUTHORIZED]: unauthorizedResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
    },
  });

  // PUT /auth/profile
  registry.registerPath({
    method: "put",
    path: "/auth/profile",
    tags: ["Authentication"],
    summary: "Update profile for the authenticated user",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: UpdateUserProfileSchema,
          },
        },
      },
    },
    responses: {
      [HTTP_STATUS.OK]: {
        description: "Profile successfully updated",
        content: {
          "application/json": {
            schema: z.object({ user: UserProfileSchema }),
          },
        },
      },
      [HTTP_STATUS.BAD_REQUEST]: {
        description: "Validation error - missing or invalid fields",
        content: {
          "application/json": {
            schema: ErrorSchema,
            example: updateProfileValidationExample,
          },
        },
      },
      [HTTP_STATUS.UNAUTHORIZED]: unauthorizedResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
    },
  });

  // GET /verified-email/{token}
  registry.registerPath({
    method: "get",
    path: "/verified-email/{token}",
    tags: ["Authentication"],
    summary: "Verify user email",
    description:
      "After register users received an email with a link to trigger this endpoint and verify their email",
    request: {
      params: z.object({
        token: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIs..." }),
      }),
    },
    responses: {
      [HTTP_STATUS.OK]: {
        description:
          "Redirect user to /verified page, if token expired redirect to /verification-expired (page that confirm user registration is completed)",
      },
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
    },
  });

  // POST /auth/resend-verification-email
  registry.registerPath({
    method: "post",
    path: "/auth/resend-verification-email",
    tags: ["Authentication"],
    summary: "Resend verification email",
    description:
      "Resend verification email. Useful if user have lost the email or if the link for verification expired.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              email: z.string().email().openapi({ example: "user@email.fr" }),
            }),
          },
        },
      },
    },
    responses: {
      [HTTP_STATUS.OK]: {
        description: "Verification link sent.",
        content: {
          "application/json": {
            schema: z.object({
              message: z
                .string()
                .openapi({ example: "Verification link sent." }),
            }),
          },
        },
      },
      [HTTP_STATUS.BAD_REQUEST]: userAlreadyVerifiedExample,
      [HTTP_STATUS.NOT_FOUND]: userNotFoundResponse,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: internalServerResponse,
    },
  });
};
