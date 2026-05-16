import "dotenv/config";

import { drizzle } from "drizzle-orm/neon-http";

const queryClient = process.env.DATABASE_URL;

if (!queryClient) {
  throw new Error("DATABASE_URL is required");
}

export const db = drizzle(queryClient);