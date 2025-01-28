import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";

export const userTable = table("user", {
  id: t.int().primaryKey({ autoIncrement: true }),
  username: t.text().notNull().unique(),
  password: t.text().notNull(),
  isAdmin: t.int("is_admin", { mode: "boolean" }).notNull(),
});

export const sessionTable = table("session", {
  id: t.text().primaryKey(),
  userId: t
    .int("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: t.int("expires_at", { mode: "timestamp" }).notNull(),
});
