import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import configDotenv from "~/config/dot-env";

dotenv.config(configDotenv);

function generateAccessToken(user: { _id: string; email: string }): string {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("Missing ACCESS_TOKEN_SECRET environment variable.");
  }

  if (!process.env.ACCESS_TOKEN_EXPIRES) {
    throw new Error("Missing ACCESS_TOKEN_EXPIRES environment variable.");
  }

  return jwt.sign(
    {
      data: { _id: user._id, email: user.email },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES as any }
  );
}

function generateRefreshToken(user: { _id: string; email: string }): string {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("Missing REFRESH_TOKEN_SECRET environment variable.");
  }

  if (!process.env.REFRESH_TOKEN_EXPIRES) {
    throw new Error("Missing REFRESH_TOKEN_EXPIRES environment variable.");
  }

  return jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES as any,
  });
}

export function generateMcpAccessToken(
  user: { _id: string; email: string },
  scope: string,
  resource: string
): string {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("Missing ACCESS_TOKEN_SECRET environment variable.");
  }
  return jwt.sign(
    { data: { _id: user._id, email: user.email }, scope, resource },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
}

export function generateMcpRefreshToken(
  user: { _id: string },
  scope: string,
  resource: string,
  jti: string
): string {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("Missing REFRESH_TOKEN_SECRET environment variable.");
  }
  return jwt.sign(
    { _id: user._id, jti, scope, resource },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" }
  );
}

export { generateAccessToken, generateRefreshToken };
