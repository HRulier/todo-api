import { Router } from "express";
import passport from "passport";
import AuthController from "~/controllers/auth.controller";

const authRoutes = Router();

const requireLogin = passport.authenticate("local", {
  session: false,
});

authRoutes.post("/register", AuthController.register);
authRoutes.post("/login", requireLogin, AuthController.login);
authRoutes.post("/forgot-password", AuthController.forgotPassword);
authRoutes.post("/reset-password/:token", AuthController.resetPassword);

export default authRoutes;
