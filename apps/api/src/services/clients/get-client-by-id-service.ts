import { and, eq } from "drizzle-orm";

import type { Client } from "@nexusflow/types";

import { db } from "../../db";
import { clients } from "../../db/schema/clients";
import { AppError } from "../../utils/app-error";

export async function getClientByIdService(
  id: string,
  ownerId: string,
): Promise<Client> {
  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.ownerId, ownerId)));

  if (!client) {
    throw new AppError("Client not found", 404);
  }

  return client;
}
