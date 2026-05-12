import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import OAuthAuthorizationCode from "../models/oauth-authorization-code.model";
import User from "~/models/user";
import { CustomError } from "~/utils/errors";
import HTTP_STATUS from "~/utils/http_status";
import { generateMcpAccessToken, generateMcpRefreshToken } from "~/utils/jwt";
import configDotenv from "~/config/dot-env";

dotenv.config(configDotenv);

// ─── PKCE ────────────────────────────────────────────────────────────────────

/**
 * Verifies a PKCE code_verifier against a stored code_challenge.
 * Challenge must equal BASE64URL(SHA256(verifier)).
 */
export function verifySHA256Challenge(
  verifier: string,
  challenge: string,
): boolean {
  const computed = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed),
      Buffer.from(challenge),
    );
  } catch {
    return false;
  }
}

// ─── User Authentication ──────────────────────────────────────────────────────

export async function authenticateUser(email: string, password: string) {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.password) {
    throw new CustomError("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new CustomError("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
  }

  return user;
}

// ─── Authorization Code ───────────────────────────────────────────────────────

export async function createAuthorizationCode(data: {
  clientId: string;
  userId: string;
  redirectUri: string;
  scope: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  resource: string;
}) {
  const code = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const authCode = new OAuthAuthorizationCode({
    code,
    clientId: data.clientId,
    userId: data.userId,
    redirectUri: data.redirectUri,
    scope: data.scope,
    codeChallenge: data.codeChallenge,
    codeChallengeMethod: data.codeChallengeMethod,
    resource: data.resource,
    expiresAt,
    used: false,
  });

  await authCode.save();
  return code;
}

// ─── Token Exchange ───────────────────────────────────────────────────────────

export async function exchangeCodeForTokens(data: {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
  resource: string;
}) {
  const authCode = await OAuthAuthorizationCode.findOne({
    code: data.code,
    clientId: data.clientId,
  });

  if (!authCode) {
    throw new CustomError(
      "Invalid authorization code",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
  if (authCode.used) {
    throw new CustomError(
      "Authorization code already used",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
  if (authCode.expiresAt < new Date()) {
    throw new CustomError(
      "Authorization code expired",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
  if (authCode.redirectUri !== data.redirectUri) {
    throw new CustomError("redirect_uri mismatch", HTTP_STATUS.BAD_REQUEST);
  }
  if (authCode.resource !== data.resource) {
    throw new CustomError("resource mismatch", HTTP_STATUS.BAD_REQUEST);
  }

  // Verify PKCE — the critical security check
  if (!verifySHA256Challenge(data.codeVerifier, authCode.codeChallenge)) {
    throw new CustomError(
      "Invalid PKCE code_verifier",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  // Mark code as used immediately (one-time use)
  authCode.used = true;
  await authCode.save();

  return createJwtTokenPair(
    authCode.userId.toString(),
    authCode.scope,
    authCode.resource,
  );
}

// ─── Refresh Token ────────────────────────────────────────────────────────────

export async function refreshAccessToken(data: {
  refreshToken: string;
  clientId: string;
  resource: string;
}) {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error("Missing REFRESH_TOKEN_SECRET");

  let decoded: any;
  try {
    decoded = jwt.verify(data.refreshToken, secret);
  } catch {
    throw new CustomError("Invalid refresh token", HTTP_STATUS.UNAUTHORIZED);
  }

  if (!decoded.scope || !decoded.resource || !decoded.jti) {
    throw new CustomError("Invalid refresh token", HTTP_STATUS.UNAUTHORIZED);
  }

  if (decoded.resource !== data.resource) {
    throw new CustomError("resource mismatch", HTTP_STATUS.BAD_REQUEST);
  }

  const user = await User.findById(decoded._id);
  if (!user) {
    throw new CustomError("Invalid refresh token", HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.mcpRefreshTokenJti !== decoded.jti) {
    // Replay detected — invalidate all refresh tokens for this user
    user.mcpRefreshTokenJti = null;
    await user.save();
    throw new CustomError(
      "Refresh token already used",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  return createJwtTokenPair(
    user._id.toString(),
    decoded.scope,
    decoded.resource,
  );
}

// ─── Internal helper ──────────────────────────────────────────────────────────

async function createJwtTokenPair(
  userId: string,
  scope: string,
  resource: string,
) {
  const user = await User.findById(userId);
  if (!user) {
    throw new CustomError("User not found", HTTP_STATUS.UNAUTHORIZED);
  }

  const jti = crypto.randomUUID();
  const access_token = generateMcpAccessToken(
    { _id: user._id.toString(), email: user.email },
    scope,
    resource,
  );
  const refresh_token = generateMcpRefreshToken(
    { _id: user._id.toString() },
    scope,
    resource,
    jti,
  );

  user.mcpRefreshTokenJti = jti;
  await user.save();

  return {
    access_token,
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token,
    scope,
  };
}
