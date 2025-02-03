import { drizzle } from "drizzle-orm/libsql";
import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";

export const db = drizzle({
  connection: process.env.DB_FILE_NAME!,
  casing: "snake_case",
  logger: true,
});

export const users = table("user", {
  id: t.int().primaryKey({ autoIncrement: true }),
  username: t.text().unique().notNull(),
  password: t.text().notNull(),
  isAdmin: t.int("is_admin", { mode: "boolean" }).notNull(),
});

export const sessions = table("session", {
  id: t.text().primaryKey(),
  userId: t
    .int("user_id")
    .notNull()
    .references(() => users.id),

  expiresAt: t.int("expires_at", { mode: "timestamp" }).notNull(),
});
