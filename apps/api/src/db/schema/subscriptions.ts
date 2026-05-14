import { numeric, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { clients } from "./clients";
import { users } from "./users";

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),

  plan: varchar("plan", { length: 50 }).notNull(),

  status: varchar("status", { length: 50 }).notNull(),

  mrr: numeric("mrr", { precision: 10, scale: 2 }).default("0").notNull(),

  startDate: timestamp("start_date").notNull(),

  endDate: timestamp("end_date"),

  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
