import mongoose from "mongoose";

export interface IOAuthAuthorizationCode {
  code: string;
  clientId: string;
  userId: mongoose.Types.ObjectId;
  redirectUri: string;
  scope: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  resource: string;
  expiresAt: Date;
  used: boolean;
}

export interface OAuthAuthorizationCodeDocument
  extends IOAuthAuthorizationCode, mongoose.Document {}

const OAuthAuthorizationCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  clientId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  redirectUri: { type: String, required: true },
  scope: { type: String, required: true },
  codeChallenge: { type: String, required: true },
  codeChallengeMethod: { type: String, required: true },
  resource: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

// Auto-delete expired codes after they expire
OAuthAuthorizationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<OAuthAuthorizationCodeDocument>(
  "OAuthAuthorizationCode",
  OAuthAuthorizationCodeSchema,
);
