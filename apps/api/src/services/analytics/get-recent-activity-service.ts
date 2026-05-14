import { desc, eq } from "drizzle-orm";

import { db } from "../../db";
import { activities } from "../../db/schema/activities";

export interface Activity {
  id: string;
  action: string;
  description: string;
  resource: string | null;
  resourceId: string | null;
  createdAt: Date;
}

export async function getRecentActivityService(
  ownerId: string,
  limit = 10,
): Promise<Activity[]> {
  const rows = await db
    .select()
    .from(activities)
    .where(eq(activities.ownerId, ownerId))
    .orderBy(desc(activities.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    description: row.description,
    resource: row.resource,
    resourceId: row.resourceId,
    createdAt: row.createdAt,
  }));
}
