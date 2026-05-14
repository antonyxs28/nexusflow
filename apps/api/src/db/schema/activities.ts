import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { users } from "./users";

export const activities = pgTable("activities", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  action: varchar("action", { length: 100 }).notNull(),

  description: text("description").notNull(),

  resource: varchar("resource", { length: 100 }),

  resourceId: varchar("resource_id", { length: 100 }),

  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
