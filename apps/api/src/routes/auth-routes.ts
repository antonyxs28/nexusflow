import type { FastifyInstance } from "fastify";

import { loginSchema, registerSchema } from "@nexusflow/schemas";

import { registerUserService } from "../services/auth/register-user-service";
import { loginUserService } from "../services/auth/login-user-service";
import { authMiddleware } from "../middlewares/auth-middleware";
import { AppError } from "../utils/app-error";

export async function authRoutes(server: FastifyInstance) {
  server.post("/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);

    const user = await registerUserService(body);

    return reply.status(201).send({ user });
  });

  server.post("/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const result = await loginUserService(body);

    return reply.status(200).send(result);
  });

  server.get(
    "/me",
    { preHandler: authMiddleware },
    async (request, reply) => {
      return reply.send({ user: request.user });
    },
  );

  server.setErrorHandler(async (error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        message: error.message,
      });
    }

    const zodError = error as any;
    if (zodError.name === "ZodError") {
      return reply.status(400).send({
        message: "Validation error",
        errors: zodError.issues ?? zodError.errors,
      });
    }

    console.error(error);
    return reply.status(500).send({
      message: "Internal server error",
    });
  });
}
