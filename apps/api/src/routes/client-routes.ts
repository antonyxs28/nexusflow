import type { FastifyInstance } from "fastify";

import { createClientSchema, updateClientSchema } from "@nexusflow/schemas";

import { authMiddleware } from "../middlewares/auth-middleware";
import { createClientService } from "../services/clients/create-client-service";
import { getClientsService } from "../services/clients/get-clients-service";
import { getClientByIdService } from "../services/clients/get-client-by-id-service";
import { updateClientService } from "../services/clients/update-client-service";
import { deleteClientService } from "../services/clients/delete-client-service";

import {
  bearerAuth,
  idParams,
  createClientBody,
  updateClientBody,
} from "../docs/schema-builders";

export async function clientRoutes(server: FastifyInstance) {
  server.addHook("preHandler", authMiddleware);

  server.post(
    "/",
    {
      schema: {
        tags: ["Clients"],
        summary: "Create a client",
        description:
          "Creates a new client for the authenticated user.",
        security: bearerAuth,
        body: createClientBody,
        response: {
          201: {
            description: "Client created successfully",
            $ref: "ClientSingleResponse",
          },
          400: {
            description: "Validation error",
            $ref: "ValidationError",
          },
          401: {
            description: "Unauthorized",
            $ref: "Error",
          },
        },
      },
    },
    async (request, reply) => {
      const body = createClientSchema.parse(request.body);

      const client = await createClientService({
        ...body,
        ownerId: request.user.sub,
      });

      return reply.status(201).send({ client });
    },
  );

  server.get(
    "/",
    {
      schema: {
        tags: ["Clients"],
        summary: "List clients",
        description:
          "Returns all clients belonging to the authenticated user.",
        security: bearerAuth,
        response: {
          200: {
            description: "List of clients",
            $ref: "ClientListResponse",
          },
          401: {
            description: "Unauthorized",
            $ref: "Error",
          },
        },
      },
    },
    async (request) => {
      const list = await getClientsService(request.user.sub);

      return { clients: list };
    },
  );

  server.get(
    "/:id",
    {
      schema: {
        tags: ["Clients"],
        summary: "Get client by ID",
        description:
          "Returns a single client by its ID. Scoped to the authenticated user.",
        security: bearerAuth,
        params: idParams,
        response: {
          200: {
            description: "Client details",
            $ref: "ClientSingleResponse",
          },
          401: {
            description: "Unauthorized",
            $ref: "Error",
          },
          404: {
            description: "Client not found",
            $ref: "Error",
          },
        },
      },
    },
    async (request) => {
      const { id } = request.params as { id: string };

      const client = await getClientByIdService(id, request.user.sub);

      return { client };
    },
  );

  server.patch(
    "/:id",
    {
      schema: {
        tags: ["Clients"],
        summary: "Update client",
        description:
          "Updates an existing client's information. All fields are optional.",
        security: bearerAuth,
        params: idParams,
        body: updateClientBody,
        response: {
          200: {
            description: "Client updated successfully",
            $ref: "ClientSingleResponse",
          },
          400: {
            description: "Validation error",
            $ref: "ValidationError",
          },
          401: {
            description: "Unauthorized",
            $ref: "Error",
          },
          404: {
            description: "Client not found",
            $ref: "Error",
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateClientSchema.parse(request.body);

      const client = await updateClientService(id, request.user.sub, body);

      return reply.send({ client });
    },
  );

  server.delete(
    "/:id",
    {
      schema: {
        tags: ["Clients"],
        summary: "Delete client",
        description:
          "Deletes a client by ID. Scoped to the authenticated user.",
        security: bearerAuth,
        params: idParams,
        response: {
          204: {
            description: "Client deleted successfully",
            type: "null",
          },
          401: {
            description: "Unauthorized",
            $ref: "Error",
          },
          404: {
            description: "Client not found",
            $ref: "Error",
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      await deleteClientService(id, request.user.sub);

      return reply.status(204).send();
    },
  );

}
