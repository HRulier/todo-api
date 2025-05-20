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
  validateRequest(RegisterUserSchema),
  AuthController.register
);

authRoutes.post(
  "/login",
  validateRequest(
    z.object({ email: z.string().email(), password: z.string() })
  ),
  requireLogin,
  AuthController.login
);

authRoutes.post(
  "/refresh-token",
  validateRequest(z.object({ refreshToken: z.string() }), {
    source: "cookies",
  }),
  AuthController.refresh
);

authRoutes.get(
  "/logout",
  validateRequest(z.object({ refreshToken: z.string() }), {
    source: "cookies",
  }),
  AuthController.logout
);

authRoutes.post(
  "/forgot-password",
  validateRequest(z.object({ email: z.string().email() })),
  AuthController.forgotPassword
);

authRoutes.post(
  "/reset-password/:token",
  validateRequest(z.object({ password: z.string() })),
  AuthController.resetPassword
);

authRoutes.get(
  "/reset-password/redirect/:token",
  validateRequest(z.object({ token: z.string() }), {
    source: "params",
  }),
  AuthController.resetPasswordRedirect
);

authRoutes.get(
  "/verified-email/:token",
  validateRequest(z.object({ token: z.string() }), {
    source: "params",
  }),
  AuthController.verifiedUserEmail
);

authRoutes.post(
  "/resend-verification-email",
  validateRequest(z.object({ email: z.string().email() })),
  AuthController.resendVerificationEmail
);

authRoutes.get("/profile", requireAuth, AuthController.getProfile);

authRoutes.put(
  "/profile",
  validateRequest(UpdateUserProfileSchema),
  requireAuth,
  AuthController.updateProfile
);

export default authRoutes;
