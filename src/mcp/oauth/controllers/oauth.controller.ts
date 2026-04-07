import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import dotEnvConfig from "~/config/dot-env";
import HTTP_STATUS from "~/utils/http_status";
import * as OAuthService from "../services/oauth.service";

dotenv.config(dotEnvConfig);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBaseUrl(): string {
  return process.env.API_URL || "http://localhost:1700";
}

/**
 * Encodes an object as a short-lived JWT used to bridge the login → consent
 * step without a server-side session. Signed with ACCESS_TOKEN_SECRET, expires
 * in 5 minutes.
 */
function encodeOAuthState(payload: object): string {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error("Missing ACCESS_TOKEN_SECRET");
  console.log(payload);
  return jwt.sign(payload, secret);
}

function decodeOAuthState(token: string): any {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error("Missing ACCESS_TOKEN_SECRET");
  return jwt.verify(token, secret);
}

function buildErrorRedirect(
  redirectUri: string,
  error: string,
  state?: string,
): string {
  const url = new URL(redirectUri);
  url.searchParams.set("error", error);
  if (state) url.searchParams.set("state", state);
  return url.toString();
}

// ─── Well-Known: Protected Resource Metadata (RFC 9728) ──────────────────────

export function protectedResourceMetadata(_req: Request, res: Response) {
  const base = getBaseUrl();
  res.json({
    resource: base,
    authorization_servers: [base],
    scopes_supported: ["tasks:read"],
    bearer_methods_supported: ["header"],
  });
}

// ─── Well-Known: Authorization Server Metadata (RFC 8414) ────────────────────

export function authorizationServerMetadata(_req: Request, res: Response) {
  const base = getBaseUrl();
  res.json({
    issuer: base,
    authorization_endpoint: `${base}/authorize`,
    token_endpoint: `${base}/token`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: ["tasks:read"],
    client_id_metadata_document_supported: false,
  });
}

// ─── Static Client ────────────────────────────────────────────────────────────

function getStaticClient(
  clientId: string,
): { clientName: string; redirectUris: string[] } | null {
  if (clientId !== process.env.MCP_CLIENT_ID) return null;
  const uris = (process.env.MCP_REDIRECT_URIS || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
  return { clientName: "Claude.ai", redirectUris: uris };
}

// ─── Authorization Endpoint ───────────────────────────────────────────────────

/**
 * GET /authorize
 *
 * Validates the OAuth parameters and renders either:
 * - The login form (step 1) if no credentials are provided
 * - The consent screen (step 2) after successful login
 */
export async function authorize(req: Request, res: Response) {
  const {
    response_type,
    client_id,
    redirect_uri,
    code_challenge,
    code_challenge_method,
    scope = "tasks:read",
    state,
    resource,
  } = req.query as Record<string, string>;

  // Validate required parameters before rendering anything
  if (response_type !== "code") {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .send("unsupported_response_type: only 'code' is supported");
  }

  if (!client_id || !redirect_uri || !code_challenge || !resource) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .send(
        "missing_required_parameters: client_id, redirect_uri, code_challenge, resource",
      );
  }

  if (code_challenge_method !== "S256") {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .send("invalid_request: only S256 code_challenge_method is supported");
  }

  // Validate client exists and redirect_uri is registered
  const client = getStaticClient(client_id);
  if (!client) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send("invalid_client");
  }
  if (!client.redirectUris.includes(redirect_uri)) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .send("invalid_redirect_uri: not registered for this client");
  }

  // Everything is valid — render the login form
  res.send(
    renderLoginPage({
      clientName: client.clientName,
      scope,
      // Pass OAuth params as hidden fields so the login POST can forward them
      oauthState: encodeOAuthState({
        client_id,
        redirect_uri,
        code_challenge,
        code_challenge_method,
        scope,
        state,
        resource,
      }),
    }),
  );
}

// ─── Login Form Submission ────────────────────────────────────────────────────

/**
 * POST /authorize/login
 *
 * Authenticates the user with email/password.
 * On success: renders the consent screen.
 * On failure: re-renders the login form with an error message.
 */
export async function authorizeLogin(req: Request, res: Response) {
  const { email, password, oauth_state } = req.body;

  let oauthParams: any;
  try {
    oauthParams = decodeOAuthState(oauth_state);
  } catch {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .send("invalid_request: oauth_state expired or invalid");
  }

  try {
    console.log(email, password);
    const user = await OAuthService.authenticateUser(email, password);
    console.log(user);

    // User is authenticated — render consent screen
    const client = getStaticClient(oauthParams.client_id);
    const clientName = client?.clientName || oauthParams.client_id;

    console.log("here");
    // New short-lived token that now includes the authenticated user ID
    const consentState = encodeOAuthState({
      ...oauthParams,
      user_id: user._id.toString(),
    });

    console.log("consentState");

    res.send(
      renderConsentPage({ clientName, scope: oauthParams.scope, consentState }),
    );
  } catch (err) {
    console.log(err);
    // Re-render login with error — decode client name if possible
    const client = getStaticClient(oauthParams.client_id);
    res.status(HTTP_STATUS.UNAUTHORIZED).send(
      renderLoginPage({
        clientName: client?.clientName || oauthParams.client_id,
        scope: oauthParams.scope,
        oauthState: oauth_state,
        error: "Invalid email or password. Please try again.",
      }),
    );
  }
}

// ─── Consent Form Submission ──────────────────────────────────────────────────

/**
 * POST /authorize/consent
 *
 * User grants or denies access.
 * On grant: creates an authorization code and redirects to redirect_uri.
 * On deny: redirects with error=access_denied.
 */
export async function authorizeConsent(req: Request, res: Response) {
  const { consent_state, action } = req.body;

  let oauthParams: any;
  try {
    oauthParams = decodeOAuthState(consent_state);
  } catch {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .send("invalid_request: consent_state expired or invalid");
  }

  const {
    client_id,
    redirect_uri,
    code_challenge,
    code_challenge_method,
    scope,
    state,
    resource,
    user_id,
  } = oauthParams;

  if (action === "deny") {
    return res.redirect(
      buildErrorRedirect(redirect_uri, "access_denied", state),
    );
  }

  try {
    const code = await OAuthService.createAuthorizationCode({
      clientId: client_id,
      userId: user_id,
      redirectUri: redirect_uri,
      scope,
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method,
      resource,
    });

    const callbackUrl = new URL(redirect_uri);
    callbackUrl.searchParams.set("code", code);
    if (state) callbackUrl.searchParams.set("state", state);

    return res.redirect(callbackUrl.toString());
  } catch {
    return res.redirect(
      buildErrorRedirect(redirect_uri, "server_error", state),
    );
  }
}

// ─── Token Endpoint ───────────────────────────────────────────────────────────

/**
 * POST /token
 *
 * Handles:
 * - grant_type=authorization_code (initial token exchange)
 * - grant_type=refresh_token (token refresh with rotation)
 */
export async function token(req: Request, res: Response) {
  const { grant_type, client_id } = req.body;

  if (!getStaticClient(client_id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: "invalid_client",
      error_description: "Unknown client_id",
    });
  }

  try {
    if (grant_type === "authorization_code") {
      const { code, redirect_uri, code_verifier, resource } = req.body;

      if (!code || !redirect_uri || !client_id || !code_verifier || !resource) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: "invalid_request",
          error_description: "Missing required parameters",
        });
      }

      const tokens = await OAuthService.exchangeCodeForTokens({
        code,
        clientId: client_id,
        redirectUri: redirect_uri,
        codeVerifier: code_verifier,
        resource,
      });

      return res.json(tokens);
    }

    if (grant_type === "refresh_token") {
      const { refresh_token, resource } = req.body;

      if (!refresh_token || !client_id || !resource) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: "invalid_request",
          error_description: "Missing required parameters",
        });
      }

      const tokens = await OAuthService.refreshAccessToken({
        refreshToken: refresh_token,
        clientId: client_id,
        resource,
      });

      return res.json(tokens);
    }

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: "unsupported_grant_type",
    });
  } catch (err: any) {
    console.log(err);
    return res.status(err.statusCode || HTTP_STATUS.BAD_REQUEST).json({
      error: "invalid_grant",
      error_description: err.message,
    });
  }
}

// ─── HTML Views ───────────────────────────────────────────────────────────────

interface LoginPageOptions {
  clientName: string;
  scope: string;
  oauthState: string;
  error?: string;
}

function renderLoginPage(opts: LoginPageOptions): string {
  const scopeLabel =
    opts.scope === "tasks:read" ? "Read your tasks" : opts.scope;
  const errorHtml = opts.error
    ? `<div class="error">${escapeHtml(opts.error)}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign in — Todo App</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      padding: 2.5rem;
      width: 100%;
      max-width: 400px;
    }
    .logo { text-align: center; margin-bottom: 1.5rem; }
    .logo span { font-size: 2rem; }
    h1 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.25rem; }
    .subtitle { color: #666; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .scope-box {
      background: #f0f7ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: #1d4ed8;
      margin-bottom: 1.5rem;
    }
    .scope-box strong { display: block; margin-bottom: 0.25rem; color: #1e3a8a; }
    label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.375rem; }
    input[type="email"], input[type="password"] {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      outline: none;
      transition: border-color 0.15s;
    }
    input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
    button[type="submit"] {
      width: 100%;
      padding: 0.75rem;
      background: #6366f1;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    button:hover { background: #4f46e5; }
    .error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .client-name { font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo"><span>✅</span></div>
    <h1>Sign in to Todo App</h1>
    <p class="subtitle">
      <span class="client-name">${escapeHtml(opts.clientName)}</span> is requesting access to your account.
    </p>
    <div class="scope-box">
      <strong>This app will be able to:</strong>
      ${escapeHtml(scopeLabel)}
    </div>
    ${errorHtml}
    <form method="POST" action="/authorize/login">
      <input type="hidden" name="oauth_state" value="${escapeHtml(opts.oauthState)}" />
      <label for="email">Email</label>
      <input type="email" id="email" name="email" required autocomplete="email" />
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required autocomplete="current-password" />
      <button type="submit">Sign in &amp; Continue</button>
    </form>
  </div>
</body>
</html>`;
}

interface ConsentPageOptions {
  clientName: string;
  scope: string;
  consentState: string;
}

function renderConsentPage(opts: ConsentPageOptions): string {
  const scopeLabel =
    opts.scope === "tasks:read" ? "Read your tasks" : opts.scope;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Authorize — Todo App</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      padding: 2.5rem;
      width: 100%;
      max-width: 400px;
    }
    .logo { text-align: center; margin-bottom: 1.5rem; }
    .logo span { font-size: 2rem; }
    h1 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.25rem; }
    .subtitle { color: #666; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .permissions {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    .permissions h2 { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem; }
    .permission-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #374151;
    }
    .permission-item::before { content: "✓"; color: #059669; font-weight: 700; }
    .actions { display: flex; gap: 0.75rem; }
    .btn {
      flex: 1;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: background 0.15s;
    }
    .btn-deny { background: #f3f4f6; color: #374151; }
    .btn-deny:hover { background: #e5e7eb; }
    .btn-allow { background: #6366f1; color: #fff; }
    .btn-allow:hover { background: #4f46e5; }
    .client-name { font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo"><span>✅</span></div>
    <h1>Authorize access</h1>
    <p class="subtitle">
      <span class="client-name">${escapeHtml(opts.clientName)}</span> wants to access your Todo App account.
    </p>
    <div class="permissions">
      <h2>This app will be able to:</h2>
      <div class="permission-item">${escapeHtml(scopeLabel)}</div>
    </div>
    <form method="POST" action="/authorize/consent">
      <input type="hidden" name="consent_state" value="${escapeHtml(opts.consentState)}" />
      <div class="actions">
        <button type="submit" name="action" value="deny" class="btn btn-deny">Deny</button>
        <button type="submit" name="action" value="allow" class="btn btn-allow">Allow</button>
      </div>
    </form>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
