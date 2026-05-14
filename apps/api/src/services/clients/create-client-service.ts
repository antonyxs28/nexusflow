import { createClientSchema } from "@nexusflow/schemas";
import type { Client, CreateClientInput } from "@nexusflow/types";

import { db } from "../../db";
import { clients } from "../../db/schema/clients";
import { AppError } from "../../utils/app-error";

export async function createClientService(
  input: CreateClientInput & { ownerId: string },
): Promise<Client> {
  const { ownerId, ...data } = input;
  const { name, email, company, status, plan, mrr } =
    createClientSchema.parse(data);

  const [client] = await db
    .insert(clients)
    .values({
      name,
      email,
      company,
      status,
      plan,
      mrr,
      ownerId,
    })
    .returning();

  return client;
}
