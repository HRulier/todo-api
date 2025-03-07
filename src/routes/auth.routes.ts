import { Router } from "express";
import { z } from "zod";
import AuthController from "~/controllers/auth.controller";
import { requireLogin } from "~/middlewares/auth.handler";
import validateRequest from "~/middlewares/validateRequest.handler";
import { registerUserSchema } from "~/schemas/user.schema";

const authRoutes = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and returns a JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInputRegister'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The user's ID
 *                       example: "65a7cfd49d1b3a001f8f3c5a"
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: The registered email
 *                       example: "user@example.com"
 *       400:
 *         description: Bad request - Validation error / missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *             examples:
 *               missingField:
 *                 $ref: '#/components/schemas/UserMissingFieldExample'
 *               invalidField:
 *                 $ref: '#/components/schemas/UserInvalidFieldExample'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *             examples:
 *               InternalServerError:
 *                 $ref: '#/components/schemas/InternalServerErrExample'
 */

authRoutes.post(
  "/register",
  validateRequest(registerUserSchema),
  AuthController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates the user with their email and password, and returns a JWT token for further API requests.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInputLogin'
 *     responses:
 *       200:
 *         description: Login successful, returns a JWT token and user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *                 refreshToken:
 *                   type: string
 *                   description: Refresh token to use to get a new access token when the current one expires
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Validation error / missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *             examples:
 *               missingField:
 *                 $ref: '#/components/schemas/UserMissingFieldExample'
 *               invalidField:
 *                 $ref: '#/components/schemas/UserInvalidFieldExample'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *             examples:
 *               Unauthorized:
 *                 $ref: '#/components/schemas/RequireAuthErrExample'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *             examples:
 *               InternalServerError:
 *                 $ref: '#/components/schemas/InternalServerErrExample'
 */

authRoutes.post(
  "/login",
  validateRequest(
    z.object({ email: z.string().email(), password: z.string() })
  ),
  requireLogin,
  AuthController.login
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Obtain a new access token using a refresh token
 *     description: Use a refresh token to obtain a new access token when user token has expired.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIs..."
 *     responses:
 *       200:
 *         description: Refresh token successful, returns a new JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: "eyJhbGciOiJIUzI1NiIs..."
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *             examples:
 *               missingField:
 *                  $ref: '#/components/schemas/MissingRefreshTokenExample'
 *               invalidField:
 *                  $ref: '#/components/schemas/InvalidRefreshTokenExample'
 *       403:
 *         description: Access denied - invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *             examples:
 *               InvalidRefreshTokenError:
 *                 summary: 'Invalid refresh token'
 *                 value:
 *                   status: 'error'
 *                   message: 'Invalid Refresh Token'
 *                   errors: []
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *             examples:
 *               InternalServerError:
 *                 $ref: '#/components/schemas/InternalServerErrExample'
 */

authRoutes.post(
  "/refresh-token",
  validateRequest(z.object({ refreshToken: z.string() })),
  AuthController.refresh
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Remove refresh token
 *     description: Revokes the refresh token to prevent future token renewals
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIs..."
 *     responses:
 *       200:
 *         description: Remove refresh token successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Logout success
 *                   example: "Logout success"
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *             examples:
 *               missingField:
 *                  $ref: '#/components/schemas/MissingRefreshTokenExample'
 *               invalidField:
 *                  $ref: '#/components/schemas/InvalidRefreshTokenExample'
 *       404:
 *         description: User not found. The refresh token provided is not associated with any registered user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "The requested user was not found"
 *                 errors:
 *                   type: array
 *                   example: []
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *             examples:
 *               InternalServerError:
 *                 $ref: '#/components/schemas/InternalServerErrExample'
 */

authRoutes.post(
  "/logout",
  validateRequest(z.object({ refreshToken: z.string() })),
  AuthController.logout
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: Initiates a password reset process by sending a password reset link to the user's email address, if the email is registered in the system.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent successfully. A link to reset the password has been sent to the user's email address.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please check your email for the link to reset your password."
 *       404:
 *         description: User not found. The email address provided is not associated with any registered user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Can't find user for this email"
 *                 errors:
 *                   type: array
 *                   example: []
 *       400:
 *         description: Bad request, missing required field. The email field must be provided for the password reset process to be initiated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *             examples:
 *               invalidField:
 *                 $ref: '#/components/schemas/UserInvalidFieldExample'
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *             examples:
 *               InternalServerError:
 *                 $ref: '#/components/schemas/InternalServerErrExample'
 */

authRoutes.post(
  "/forgot-password",
  validateRequest(z.object({ email: z.string().email() })),
  AuthController.forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password/{resetToken}:
 *   post:
 *     summary: Reset password
 *     description: Resets the user's password using a valid password reset token and a new password provided by the user. The token is usually sent to the user's email after they request a password reset.
 *     parameters:
 *       - in: path
 *         name: resetToken
 *         required: true
 *         description: The reset token provided in the password reset email
 *         schema:
 *           type: string
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's password
 *                 example: "strongpassword?123"
 *     responses:
 *       200:
 *         description: Password reset successful. The user's password has been successfully updated and can now be used for login.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message indicating that the password was successfully reset.
 *                   example: "Your password has been changed."
 *       422:
 *         description: Invalid token. The password reset token is either expired, invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Password reset token is invalid or has expired."
 *                 errors:
 *                   type: array
 *                   example: []
 *       400:
 *         description: Bad request, missing required field. The password field must be provided.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *             examples:
 *               MissingFieldError:
 *                 summary: 'Missing password'
 *                 value:
 *                   status: 'error'
 *                   message: 'Validation failed'
 *                   errors: [{
 *                     "path": "password",
 *                     "message": "Required"
 *                   }]
 *               InvalidFieldError:
 *                 summary: 'Invalid password'
 *                 value:
 *                   status: 'error'
 *                   message: 'Validation failed'
 *                   errors: [{
 *                     "path": "password",
 *                     "message": "Expected string, received number"
 *                  }]
 *       500:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *             examples:
 *               InternalServerError:
 *                 $ref: '#/components/schemas/InternalServerErrExample'
 */

authRoutes.post(
  "/reset-password/:token",
  validateRequest(z.object({ password: z.string() })),
  AuthController.resetPassword
);

export default authRoutes;
