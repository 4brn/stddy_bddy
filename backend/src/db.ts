import { drizzle } from "drizzle-orm/libsql";
import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";

export const db = drizzle({
  connection: process.env.DB_FILE_NAME!,
  casing: "snake_case",
  logger: false,
});

export const usersTable = table("users", {
  id: t.int().primaryKey({ autoIncrement: true }),
  username: t.text().unique().notNull(),
  password: t.text().notNull(),
  role: t.text({ enum: ["admin", "user"] }).notNull(),
});

export const sessionsTable = table("sessions", {
  id: t.text().primaryKey(),
  userId: t
    .int("user_id")
    .references(() => usersTable.id)
    .notNull(),
  expiresAt: t.int("expires_at", { mode: "timestamp" }).notNull(),
});
