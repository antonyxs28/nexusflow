import type { FastifyInstance } from "fastify";

import { loginSchema, registerSchema } from "@nexusflow/schemas";

import { registerUserService } from "../services/auth/register-user-service";
import { loginUserService } from "../services/auth/login-user-service";
import { getUserByIdService } from "../services/auth/get-user-by-id-service";
import { authMiddleware } from "../middlewares/auth-middleware";
import { registerRateLimiter } from "../plugins/rate-limiter";
import { env } from "../env";

import { bearerAuth, registerBody, loginBody } from "../docs/schema-builders";

export async function authRoutes(server: FastifyInstance) {
  await registerRateLimiter(server, {
    max: env.RATE_LIMIT_AUTH_MAX,
    timeWindow: env.RATE_LIMIT_AUTH_TIME_WINDOW,
  });

  server.post(
    "/register",
    {
      schema: {
        tags: ["Auth"],
        summary: "Register a new user",
        description:
          "Creates a new user account with name, email, and password.",
        body: registerBody,
        response: {
          201: {
            description: "User registered successfully",
            $ref: "UserSingleResponse",
          },
          400: {
            description: "Validation error",
            $ref: "ValidationError",
          },
          409: {
            description: "Email already registered",
            $ref: "Error",
          },
        },
      },
    },
    async (request, reply) => {
      const body = registerSchema.parse(request.body);
      const user = await registerUserService(body);
      return reply.status(201).send({ user });
    },
  );

  server.post(
    "/login",
    {
      schema: {
        tags: ["Auth"],
        summary: "Login user",
        description:
          "Authenticates a user with email and password, returns a JWT token.",
        body: loginBody,
        response: {
          200: {
            description: "Login successful",
            $ref: "AuthResponse",
          },
          400: {
            description: "Validation error",
            $ref: "ValidationError",
          },
          401: {
            description: "Invalid email or password",
            $ref: "Error",
          },
        },
      },
    },
    async (request, reply) => {
      const body = loginSchema.parse(request.body);
      const result = await loginUserService(body);
      return reply.status(200).send(result);
    },
  );

  server.get(
    "/me",
    {
      schema: {
        tags: ["Auth"],
        summary: "Get current user",
        description:
          "Returns the authenticated user's profile information. Requires a valid JWT token.",
        security: bearerAuth,
        response: {
          200: {
            description: "Current user profile",
            $ref: "UserSingleResponse",
          },
          401: {
            description: "Unauthorized - missing or invalid JWT",
            $ref: "Error",
          },
        },
      },
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const user = await getUserByIdService(request.user.sub);
      return reply.send({ user });
    },
  );
}
