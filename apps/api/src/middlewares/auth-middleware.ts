import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

import type { JwtPayload } from "@nexusflow/types";
import { AppError } from "../utils/app-error";

declare module "fastify" {
  interface FastifyRequest {
    user: JwtPayload;
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
) {
  const authorization = request.headers.authorization;
  let authHeader = "";

  if (typeof authorization === "string") {
    authHeader = authorization.trim();
  } else if (Array.isArray(authorization)) {
    const authorizationArray = authorization as string[];
    authHeader = authorizationArray.join(" ").trim();
  }

  if (!authHeader) {
    throw new AppError("Missing authorization header", 401);
  }

  const [scheme, ...tokenParts] = authHeader.split(/\s+/);
  const token = tokenParts.join(" ").trim();

  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
    throw new AppError("Invalid authorization scheme", 401);
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new AppError("JWT_SECRET is not configured", 500);
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    request.user = decoded;
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}
