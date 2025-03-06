import { NextFunction, Response, Request } from "express";
import passport from "passport";

const requireLogin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    {
      session: false,
    },
    (err: any, user: any, info: any) => {
      if (err) return next(err); // Pass unexpected errors to Express error handler

      if (!user) {
        return res.status(401).json({ error: info?.error || "Unauthorized" });
      }

      req.user = user; // Attach the user to the request for later use
      next(); // Proceed to the next middleware/controller
    }
  )(req, res, next);
};

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err) return next(err); // Handle unexpected errors

      if (info?.message && process.env.NODE_ENV !== "production") {
        console.log(`JsonWebTokenError: ${info.message}`);
      }

      if (!user) {
        return res.status(401).json({
          error: "Invalid or expired token. Please log in again.",
        });
      }

      req.user = user; // Attach the user to the request for later use
      next(); // Proceed to the next middleware/controller
    }
  )(req, res, next);
};

export { requireLogin, requireAuth };
