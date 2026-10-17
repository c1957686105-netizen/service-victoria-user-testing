import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const sessions = sqliteTable("study_sessions", {
 id: text("id").primaryKey(), ownerId: text("owner_id").notNull(), revision: integer("revision").notNull(), document: text("document").notNull(), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
}, (t) => [index("study_sessions_owner").on(t.ownerId)]);
