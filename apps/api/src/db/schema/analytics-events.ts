import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { clients } from "./clients";
import { users } from "./users";

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  clientId: uuid("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),

  event: varchar("event", { length: 100 }).notNull(),

  metadata: jsonb("metadata"),

  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
