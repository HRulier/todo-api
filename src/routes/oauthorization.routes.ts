import { Router, RequestHandler } from "express";
import * as OAuthController from "../controllers/oauthorization.controller";

const router = Router();

// ── Discovery endpoints (RFC 9728 + RFC 8414) ──────────────────────────────
// These are mounted at the root level (not under /api) so they are accessible
// at /.well-known/*
router.get(
  "/.well-known/oauth-protected-resource",
  OAuthController.protectedResourceMetadata,
);
router.get(
  "/.well-known/oauth-authorization-server",
  OAuthController.authorizationServerMetadata,
);

router.get("/authorize", OAuthController.authorize as RequestHandler);
router.post(
  "/authorize/login",
  OAuthController.authorizeLogin as RequestHandler,
);
router.post(
  "/authorize/consent",
  OAuthController.authorizeConsent as RequestHandler,
);

router.post(
  "/authorize/token",
  OAuthController.token as unknown as RequestHandler,
);

export default router;
