import mongoose from "mongoose";

export interface IOAuthClient {
  clientId: string;
  clientName: string;
  redirectUris: [string];
  grantTypes: [string];
  responseTypes: [string];
  scope: string;
  tokenEndpointAuthMethod: string;
  clientIssuedAt: number;
  clientSecretExpiresAt: number;
}

export interface OAuthClientDocument extends IOAuthClient, mongoose.Document {}
