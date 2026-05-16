import type { z } from "zod";
import type {
  registerSchema,
  loginSchema,
  createClientSchema,
  updateClientSchema,
} from "@nexusflow/schemas";

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: SafeUser;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  plan: string;
  mrr: string;
  ownerId: string;
  createdAt: Date;
}
