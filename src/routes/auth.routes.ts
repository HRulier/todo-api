import { Router } from "express";
import z from "zod";
import AuthController from "~/controllers/auth.controller";
import { requireAuth, requireLogin } from "~/middlewares/auth.handler";
import validateRequest from "~/middlewares/validateRequest.handler";
import {
  registerUserSchema,
  updateUserProfileSchema,
} from "~/schemas/user.schema";

const authRoutes = Router();

authRoutes.post(
  "/register",
  validateRequest(registerUserSchema),
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
  validateRequest(z.object({ refreshToken: z.string() })),
  AuthController.refresh
);

authRoutes.post(
  "/logout",
  validateRequest(z.object({ refreshToken: z.string() })),
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

authRoutes.get("/profile", requireAuth, AuthController.getProfile);

authRoutes.put(
  "/profile",
  validateRequest(updateUserProfileSchema),
  requireAuth,
  AuthController.updateProfile
);

export default authRoutes;
