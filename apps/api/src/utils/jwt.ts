import jwt from "jsonwebtoken";

import type { JwtPayload } from "../types/auth";
import { env } from "../env";
import { AppError } from "./app-error";

const ALGORITHM = "HS256";
const EXPIRES_IN = "7d";
const MIN_SECRET_LENGTH = 32;

export function validateJwtSecret(secret: string): void {
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters (current: ${secret.length}). ` +
      `Generate one: openssl rand -base64 48`,
    );
  }

  const hasUpper = /[A-Z]/.test(secret);
  const hasLower = /[a-z]/.test(secret);
  const hasDigit = /[0-9]/.test(secret);
  const hasSpecial = /[^A-Za-z0-9]/.test(secret);
  const types = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;

  if (types < 3) {
    throw new Error(
      "JWT_SECRET is too weak. Use a mix of upper, lower, digits, and special characters. " +
      "Generate one: openssl rand -base64 48",
    );
  }
}

export function signAccessToken(sub: string, role: string): string {
  return jwt.sign(
    { sub, role },
    env.JWT_SECRET,
    { algorithm: ALGORITHM, expiresIn: EXPIRES_IN },
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: [ALGORITHM],
    }) as jwt.JwtPayload;

    if (!decoded.sub || typeof decoded.sub !== "string") {
      throw new AppError("Invalid token payload: missing sub", 401);
    }

    return {
      sub: decoded.sub,
      role: typeof decoded.role === "string" ? decoded.role : "",
      iat: typeof decoded.iat === "number" ? decoded.iat : Math.floor(Date.now() / 1000),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;

    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Token expired. Please login again.", 401);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid token. Please login again.", 401);
    }

    throw new AppError("Authentication failed", 401);
  }
}

export function getTokenExpiration(): { expiresIn: string; ms: number } {
  const match = EXPIRES_IN.match(/^(\d+)([smhd])$/);
  if (!match) return { expiresIn: EXPIRES_IN, ms: 7 * 24 * 60 * 60 * 1000 };

  const value = parseInt(match[1]!, 10);
  const unit = match[2]!;
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return {
    expiresIn: EXPIRES_IN,
    ms: value * (multipliers[unit] ?? 1),
  };
}

export { EXPIRES_IN as TOKEN_EXPIRES_IN };
