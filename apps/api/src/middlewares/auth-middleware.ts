import type { FastifyReply, FastifyRequest } from "fastify";

import type { JwtPayload } from "../types/auth";
import { verifyAccessToken } from "../utils/jwt";
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
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError("Missing Authorization header", 401);
  }

  const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  if (!headerValue) {
    throw new AppError("Missing Authorization header", 401);
  }

  const parts = headerValue.split(" ");

  if (parts.length !== 2) {
    throw new AppError(
      "Invalid Authorization format. Expected: Bearer <token>",
      401,
    );
  }

  const [scheme, token] = parts;

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new AppError(
      "Invalid Authorization format. Expected: Bearer <token>",
      401,
    );
  }

  request.user = verifyAccessToken(token);
}
