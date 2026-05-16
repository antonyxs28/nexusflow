import { index, numeric, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { users } from "./users";

export const clients = pgTable("clients", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  name: varchar("name", { length: 255 }).notNull(),

  email: varchar("email", { length: 255 }).notNull(),

  company: varchar("company", { length: 255 }).notNull(),

  status: varchar("status", { length: 50 }).default("active").notNull(),

  plan: varchar("plan", { length: 50 }).default("free").notNull(),

  mrr: numeric("mrr", { precision: 10, scale: 2 }).default("0").notNull(),

  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_clients_owner_id").on(table.ownerId),
]);
