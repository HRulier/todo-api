import mongoose from "mongoose";
import { OAuthClientDocument } from "~/types/oauth-client";

const OAuthAuthorizationCodeSchema = new mongoose.Schema({
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  redirectUris: { type: [String], required: true },
  grantTypes: { type: [String], required: true },
  responseTypes: { type: [String], required: true, default: ["code"] },
  scope: { type: String, required: true },
  tokenEndpointAuthMethod: { type: String, required: true, default: "none" },
  clientIssuedAt: { type: Number, required: true },
  clientSecretExpiresAt: { type: Number, required: true, default: 0 },
});

// Auto-delete expired codes after they expire
OAuthAuthorizationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<OAuthClientDocument>(
  "OAuthClientDocument",
  OAuthAuthorizationCodeSchema,
);
