import { Router } from "express";
import z from "zod";
import AuthController from "~/controllers/auth.controller";
import { requireAuth, requireLogin } from "~/middlewares/auth.handler";
import validateRequest from "~/middlewares/validateRequest.handler";
import {
  RegisterUserSchema,
  UpdateUserProfileSchema,
} from "~/schemas/user.schema";

const authRoutes = Router();

authRoutes.post(
  "/register",
  validateRequest({ body: RegisterUserSchema }),
  AuthController.register
);

authRoutes.post(
  "/login",
  validateRequest({
    body: z.object({ email: z.string().email(), password: z.string() }),
  }),
  requireLogin,
  AuthController.login
);

//Google OAuth2 endpoints
authRoutes.get("/google", AuthController.loginWithGoogle);
authRoutes.get("/google/callback", AuthController.loginWithGoogleCallback);
// **** //

authRoutes.post(
  "/refresh-token",
  validateRequest({
    cookies: z.object({ refreshToken: z.string() }),
  }),
  AuthController.refresh
);

authRoutes.get(
  "/logout",
  validateRequest({
    cookies: z.object({ refreshToken: z.string() }),
  }),
  AuthController.logout
);

authRoutes.post(
  "/forgot-password",
  validateRequest({ body: z.object({ email: z.string().email() }) }),
  AuthController.forgotPassword
);

authRoutes.post(
  "/reset-password/:token",
  validateRequest({ body: z.object({ password: z.string() }) }),
  AuthController.resetPassword
);

authRoutes.get(
  "/reset-password/redirect/:token",
  validateRequest({
    params: z.object({ token: z.string() }),
  }),
  AuthController.resetPasswordRedirect
);

authRoutes.post(
  "/change-password",
  requireAuth,
  validateRequest({
    body: z.object({ currentPassword: z.string(), newPassword: z.string() }),
  }),
  AuthController.changePassword
);

authRoutes.get(
  "/verified-email/:token",
  validateRequest({
    params: z.object({ token: z.string() }),
  }),
  AuthController.verifiedUserEmail
);

authRoutes.post(
  "/resend-verification-email",
  validateRequest({ body: z.object({ email: z.string().email() }) }),
  AuthController.resendVerificationEmail
);

authRoutes.get("/profile", requireAuth, AuthController.getProfile);

authRoutes.put(
  "/profile",
  validateRequest({ body: UpdateUserProfileSchema }),
  requireAuth,
  AuthController.updateProfile
);

authRoutes.delete("/account", requireAuth, AuthController.deleteUser);

export default authRoutes;
