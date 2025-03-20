import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { createSchemaFactory } from "drizzle-zod";

export const usersTable = table("users", {
  id: t.int().primaryKey({ autoIncrement: true }).notNull(),
  username: t.text().unique().notNull(),
  password: t.text().notNull(),
  role: t.text({ enum: ["admin", "user"] }).notNull(),
});

export const sessionsTable = table("sessions", {
  id: t.text().primaryKey().notNull(),
  userId: t
    .int("user_id")
    .references(() => usersTable.id)
    .notNull(),
  expiresAt: t.int("expires_at", { mode: "timestamp" }).notNull(),
});

export type Question = {
  id: number;
  question: string;
  options: Answer[];
  correct: string | number;
};

export type Answer = {
  id: number;
  value: string | number;
};

export const testsTable = table("tests", {
  id: t.int().primaryKey({ autoIncrement: true }).notNull(),
  title: t.text().notNull(),
  isPrivate: t.int("is_private", { mode: "boolean" }).notNull(),
  content: t.text({ mode: "json" }).$type<Question[]>().notNull(),
  ownerId: t
    .int("owner_id")
    .references(() => usersTable.id)
    .notNull(),
  createdAt: t.int("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: t.int("updated_at", { mode: "timestamp" }).notNull(),
});

export const likesTable = table("likes", {
  id: t.int().primaryKey({ autoIncrement: true }),
  testId: t
    .int("test_id")
    .references(() => testsTable.id)
    .notNull(),
  userId: t
    .int("user_id")
    .references(() => usersTable.id)
    .notNull(),
});

export const { createInsertSchema } = createSchemaFactory({
  coerce: {
    date: true,
  },
});

export const TestSchema = createInsertSchema(testsTable);
export type User = typeof usersTable.$inferSelect;
export type Session = typeof sessionsTable.$inferSelect;
export type Test = typeof testsTable.$inferSelect;
export type Like = typeof likesTable.$inferSelect;
