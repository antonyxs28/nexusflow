import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  company: z.string().min(2),
  status: z.enum(["active", "inactive", "churned", "lead"]).optional(),
  plan: z.enum(["free", "starter", "pro", "enterprise"]).optional(),
  mrr: z.string().optional(),
});

export const updateClientSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.email().optional(),
  company: z.string().min(2).optional(),
  status: z.enum(["active", "inactive", "churned", "lead"]).optional(),
  plan: z.enum(["free", "starter", "pro", "enterprise"]).optional(),
  mrr: z.string().optional(),
});
