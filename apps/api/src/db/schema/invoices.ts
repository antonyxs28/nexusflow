import { index, numeric, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { clients } from "./clients";
import { subscriptions } from "./subscriptions";
import { users } from "./users";

export const invoices = pgTable("invoices", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),

  subscriptionId: uuid("subscription_id")
    .notNull()
    .references(() => subscriptions.id, { onDelete: "cascade" }),

  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),

  currency: varchar("currency", { length: 3 }).default("USD").notNull(),

  status: varchar("status", { length: 50 }).notNull(),

  dueDate: timestamp("due_date").notNull(),

  paidAt: timestamp("paid_at"),

  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_invoices_owner_status_created")
    .on(table.ownerId, table.status, table.createdAt),
]);
