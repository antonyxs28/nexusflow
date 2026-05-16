import { index, integer, pgTable, date, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { users } from "./users";

export const trafficSources = pgTable("traffic_sources", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  source: varchar("source", { length: 50 }).notNull(),

  visitors: integer("visitors").default(0).notNull(),

  pageViews: integer("page_views").default(0).notNull(),

  leads: integer("leads").default(0).notNull(),

  date: date("date").notNull(),

  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_traffic_sources_owner_source").on(table.ownerId, table.source),
]);
