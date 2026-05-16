import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

import { AppError } from "../utils/app-error";
import { env } from "../env";
import { logger } from "../utils/logger";

const STATUS_TEXT: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error",
};

function statusText(code: number): string {
  return STATUS_TEXT[code] ?? "Error";
}

function isProduction(): boolean {
  return env.NODE_ENV === "production";
}

export async function errorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    const statusCode = error.statusCode;
    return reply.status(statusCode).send({
      message: error.message,
      statusCode,
      error: statusText(statusCode),
    });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error",
      statusCode: 400,
      error: "Bad Request",
      errors: error.issues.map((issue) => ({
        code: issue.code,
        path: issue.path,
        message: issue.message,
      })),
    });
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    return reply.status(401).send({
      message: "Invalid or expired token",
      statusCode: 401,
      error: "Unauthorized",
    });
  }

  logger.error(error);

  const statusCode = 500;
  const body: Record<string, unknown> = {
    message: isProduction() ? "Internal server error" : error.message,
    statusCode,
    error: "Internal Server Error",
  };

  if (!isProduction() && error.stack) {
    body.stack = error.stack;
  }

  return reply.status(statusCode).send(body);
}
