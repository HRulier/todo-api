import z from "~/utils/zod/zod-extended";
import registry from "~/openapi/registry";
import {
  UserSchema,
  RegisterResponseSchema,
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
  forgotPasswordValidationExample,
  resetPasswordValidationExample,
  userNotFoundResponse,
  credentialsNotVerifiedResponse,
  invalidRefreshTokenResponse,
  userNotFoundForgotPasswordResponse,
  resetTokenTokenExpiredResponse,
} from "~/openapi/examples/auth.examples";
import {
  unauthorizedResponse,
  internalServerResponse,
} from "~/openapi/examples/error.examples";
import { ValidationErrorSchema } from "~/schemas/error.schema";

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
      200: {
        description: "Login successful, returns a JWT token and user info",
        content: {
          "application/json": {
            schema: z.object({
              refreshToken: z
                .string()
                .openapi({ example: "eyJhbGciOiJIUzI1NiIs..." }),
              token: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIs..." }),
              user: UserProfileSchema,
            }),
          },
        },
      },
      400: {
        description: "Validation error - missing or invalid fields",
        content: {
          "application/json": {
            schema: ValidationErrorSchema,
            example: loginValidationExample,
          },
        },
      },
      401: credentialsNotVerifiedResponse,
      500: internalServerResponse,
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
      201: {
        description: "User registered successfully",
        content: {
          "application/json": {
            schema: z.object({ user: RegisterResponseSchema }),
          },
        },
      },
      400: {
        description: "Validation error - missing or invalid fields",
        content: {
          "application/json": {
            schema: ValidationErrorSchema,
            example: registerValidationExample,
          },
        },
      },
      500: internalServerResponse,
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
      body: {
        content: {
          "application/json": {
            schema: z.object({
              refreshToken: z
                .string()
                .openapi({ example: "eyJhbGciOiJIUzI1NiIs..." }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Refresh token successful, returns a new JWT token",
        content: {
          "application/json": {
            schema: z.object({
              token: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIs..." }),
            }),
          },
        },
      },
      400: {
        description: "Bad request - Validation error",
        content: {
          "application/json": {
            schema: ValidationErrorSchema,
            example: refreshTokenValidationExample,
          },
        },
      },
      403: invalidRefreshTokenResponse,
      500: internalServerResponse,
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
      200: {
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
      400: {
        description: "Bad request - Validation error",
        content: {
          "application/json": {
            schema: ValidationErrorSchema,
            example: forgotPasswordValidationExample,
          },
        },
      },
      404: userNotFoundForgotPasswordResponse,
      500: internalServerResponse,
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
      200: {
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
      400: {
        description: "Bad request - Validation error",
        content: {
          "application/json": {
            schema: ValidationErrorSchema,
            example: resetPasswordValidationExample,
          },
        },
      },
      422: resetTokenTokenExpiredResponse,
      500: internalServerResponse,
    },
  });

  // POST /auth/logout
  registry.registerPath({
    method: "post",
    path: "/auth/logout",
    tags: ["Authentication"],
    summary: "Remove refresh token",
    description: "Revokes the refresh token to prevent future token renewals",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              refreshToken: z
                .string()
                .openapi({ example: "eyJhbGciOiJIUzI1NiIs..." }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Logout success",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Logout success" }),
            }),
          },
        },
      },
      400: {
        description: "Bad request - Validation error",
        content: {
          "application/json": {
            schema: ValidationErrorSchema,
            example: refreshTokenValidationExample,
          },
        },
      },
      404: userNotFoundResponse,
      500: internalServerResponse,
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
      200: {
        description: "Get profile for the authenticated user",
        content: {
          "application/json": {
            schema: z.object({ user: UserProfileSchema }),
          },
        },
      },
      401: unauthorizedResponse,
      500: internalServerResponse,
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
      200: {
        description: "Profile successfully updated",
        content: {
          "application/json": {
            schema: z.object({ user: UserProfileSchema }),
          },
        },
      },
      400: {
        description: "Validation error - missing or invalid fields",
        content: {
          "application/json": {
            schema: ValidationErrorSchema,
            example: updateProfileValidationExample,
          },
        },
      },
      401: unauthorizedResponse,
      500: internalServerResponse,
    },
  });
};
