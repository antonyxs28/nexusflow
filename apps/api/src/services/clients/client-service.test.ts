import { describe, expect, it } from "vitest";

import { registerUserService } from "../auth/register-user-service";
import { createClientService } from "./create-client-service";
import { getClientsService } from "./get-clients-service";
import { getClientByIdService } from "./get-client-by-id-service";
import { updateClientService } from "./update-client-service";
import { deleteClientService } from "./delete-client-service";
import { AppError } from "../../utils/app-error";

const ts = Date.now();

const ownerEmail = `client-owner-${ts}@nexusflow.dev`;
const otherEmail = `client-other-${ts}@nexusflow.dev`;

const mockClient = {
  name: "Acme Corp",
  email: "acme@example.com",
  company: "Acme Corporation",
  status: "active" as const,
  plan: "pro" as const,
  mrr: "2500.00",
};

describe("Client Service", () => {
  let ownerId: string;
  let otherUserId: string;
  let clientId: string;

  it("should setup test users", async () => {
    const owner = await registerUserService({
      name: "Client Owner",
      email: ownerEmail,
      password: "123456",
    });
    ownerId = owner.id;

    const other = await registerUserService({
      name: "Other User",
      email: otherEmail,
      password: "123456",
    });
    otherUserId = other.id;

    expect(ownerId).toEqual(expect.any(String));
    expect(otherUserId).toEqual(expect.any(String));
  });

  it("should create a client", async () => {
    const client = await createClientService({
      ...mockClient,
      ownerId,
    });

    expect(client).toBeDefined();
    expect(client.id).toEqual(expect.any(String));
    expect(client.name).toBe("Acme Corp");
    expect(client.email).toBe("acme@example.com");
    expect(client.company).toBe("Acme Corporation");
    expect(client.status).toBe("active");
    expect(client.plan).toBe("pro");
    expect(client.mrr).toBe("2500.00");
    expect(client.ownerId).toBe(ownerId);
    expect(client.createdAt).toEqual(expect.any(Date));

    clientId = client.id;
  });

  it("should list clients for the owner", async () => {
    const list = await getClientsService(ownerId);

    expect(list).toBeInstanceOf(Array);
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.some((c) => c.id === clientId)).toBe(true);
  });

  it("should get client by id", async () => {
    const client = await getClientByIdService(clientId, ownerId);

    expect(client).toBeDefined();
    expect(client.id).toBe(clientId);
    expect(client.name).toBe("Acme Corp");
  });

  it("should throw 404 for non-existent client", async () => {
    await expect(
      getClientByIdService("00000000-0000-0000-0000-000000000000", ownerId),
    ).rejects.toThrow(AppError);
  });

  it("should update a client", async () => {
    const updated = await updateClientService(clientId, ownerId, {
      name: "Acme Corp Updated",
      mrr: "5000.00",
    });

    expect(updated.name).toBe("Acme Corp Updated");
    expect(updated.mrr).toBe("5000.00");
    expect(updated.email).toBe("acme@example.com");
  });

  it("should not access another user's client", async () => {
    await expect(
      getClientByIdService(clientId, otherUserId),
    ).rejects.toThrow(AppError);

    await expect(
      updateClientService(clientId, otherUserId, { name: "Hacked" }),
    ).rejects.toThrow(AppError);

    await expect(
      deleteClientService(clientId, otherUserId),
    ).rejects.toThrow(AppError);
  });

  it("should delete a client", async () => {
    await deleteClientService(clientId, ownerId);

    await expect(
      getClientByIdService(clientId, ownerId),
    ).rejects.toThrow(AppError);
  });

  it("should validate input on create", async () => {
    await expect(
      createClientService({
        name: "A",
        email: "invalid",
        company: "B",
        ownerId,
      }),
    ).rejects.toThrow();
  });
});
