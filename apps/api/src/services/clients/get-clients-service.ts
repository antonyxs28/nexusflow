import { eq } from "drizzle-orm";

import type { Client } from "@nexusflow/types";

import { db } from "../../db";
import { clients } from "../../db/schema/clients";

export async function getClientsService(
  ownerId: string,
): Promise<Client[]> {
  return db.select().from(clients).where(eq(clients.ownerId, ownerId));
}
