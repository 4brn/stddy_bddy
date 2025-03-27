import { drizzle } from "drizzle-orm/libsql";

import { createSchemaFactory } from "drizzle-zod";
import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";

import type { Question } from "@shared/types";

export const db = drizzle(process.env.DB_FILE_NAME!);

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }).notNull(),
  username: text().unique().notNull(),
  password: text().notNull(),
  role: text({ enum: ["admin", "user"] }).notNull(),
});

export const sessionsTable = sqliteTable("sessions", {
  id: text().primaryKey().notNull(),
  user_id: int("user_id")
    .references(() => usersTable.id)
    .notNull(),
  expires_at: int("expires_at", { mode: "timestamp" }).notNull(),
});

export const testsTable = sqliteTable("tests", {
  id: int().primaryKey({ autoIncrement: true }).notNull(),
  author_id: int("author_id")
    .references(() => usersTable.id)
    .notNull(),
  title: text().notNull(),
  is_private: int("private", { mode: "boolean" }).notNull(),
  questions: text({ mode: "json" }).$type<Question[]>().notNull(),
  created_at: int("created_at", { mode: "timestamp" }).notNull(),
  updated_at: int("updated_at", { mode: "timestamp" }).notNull(),
});

export const likesTable = sqliteTable("likes", {
  id: int().primaryKey({ autoIncrement: true }),
  test_id: int("test_id")
    .references(() => testsTable.id)
    .notNull(),
  user_id: int("user_id")
    .references(() => usersTable.id)
    .notNull(),
});

export const schemaFactory = createSchemaFactory;
