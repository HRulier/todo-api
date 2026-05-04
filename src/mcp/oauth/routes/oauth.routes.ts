import { Router, RequestHandler } from "express";
import * as OAuthController from "../controllers/oauth.controller";

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

// ── Authorization flow ─────────────────────────────────────────────────────
router.get("/mcp/authorize", OAuthController.authorize as RequestHandler);
router.post(
  "/mcp/authorize/login",
  OAuthController.authorizeLogin as RequestHandler,
);
router.post(
  "/mcp/authorize/consent",
  OAuthController.authorizeConsent as RequestHandler,
);

// ── Token endpoint ─────────────────────────────────────────────────────────
// Must use application/x-www-form-urlencoded (handled by express.urlencoded)
router.post("/mcp/token", OAuthController.token as unknown as RequestHandler);

export default router;
