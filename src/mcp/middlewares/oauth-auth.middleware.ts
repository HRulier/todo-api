import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import configDotenv from "~/config/dot-env";
import HTTP_STATUS from "~/utils/http_status";

dotenv.config(configDotenv);

/**
 * Middleware that validates MCP OAuth Bearer tokens (JWT-based, no DB hit).
 *
 * On failure it returns 401 with the WWW-Authenticate header pointing to the
 * protected resource metadata endpoint, which is how MCP clients discover the
 * authorization server (RFC 9728).
 */
export function authenticateOAuthToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    const base = process.env.MCP_BASE_URL || "http://localhost:1700";
    res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .set(
        "WWW-Authenticate",
        `Bearer resource_metadata="${base}/.well-known/oauth-protected-resource"`,
      )
      .json({
        error: "unauthorized",
        error_description: "Bearer token required",
      });
    return;
  }

  const token = authHeader.slice("Bearer ".length);
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "server_error" });
    return;
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, secret);
  } catch {
    res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({
        error: "invalid_token",
        error_description: "Token is invalid or expired",
      });
    return;
  }

  if (!decoded.scope || !decoded.resource || !decoded.data?._id) {
    res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({
        error: "invalid_token",
        error_description: "Token is not an MCP token",
      });
    return;
  }

  (req as any).oauthUserId = decoded.data._id;
  (req as any).oauthScope = decoded.scope;

  // Set req.auth — StreamableHTTPServerTransport forwards this as extra.authInfo in tool handlers.
  // userId lives in extra so it flows through as extra.authInfo.extra.userId.
  (req as any).auth = {
    token,
    clientId: process.env.MCP_CLIENT_ID ?? "",
    scopes: decoded.scope ? (decoded.scope as string).split(" ") : [],
    extra: { userId: decoded.data._id as string },
  };

  next();
}
