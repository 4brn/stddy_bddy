import { type Request, type Response } from "express";
import { db, sessionsTable, usersTable } from "@/db";
import { eq, sql } from "drizzle-orm";
import { UserValidationSchema } from "@shared/validation";
import type { UserInsert } from "@shared/types";
import { password } from "bun";
import { logger } from "@/utils/logger";
import {
  getSessionFromCookie,
  setSessionCookie,
  validateSession,
} from "@/lib/session";

const { insert: UserInsertSchema, update: UserUpdateSchema } =
  UserValidationSchema;

export async function getUser(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  if (!token) {
    res.status(307).send({ error: "No active session found" });
    return;
  }

  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).send({ error: "Invalid id" });
    console.log("here");
    return;
  }

  const { user, session } = await validateSession(token);
  if (!session || user.role !== "admin") {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }
  setSessionCookie(res, token, session.expires_at);

  const users = await db.select().from(usersTable).where(eq(usersTable.id, id));
  res.status(200).json({ data: user });
  return;
}

export async function getUsers(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  if (!token) {
    res.status(307).send({ error: "No active session found" });
    return;
  }

  const { user, session } = await validateSession(token);
  if (!session || user.role !== "admin") {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }
  setSessionCookie(res, token, session.expires_at);

  const users = await db.select().from(usersTable);
  res.status(200).json({ data: users });
  return;
}

export async function getUsersWithSessions(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  if (!token) {
    res.status(307).send({ error: "No active session found" });
    return;
  }

  const { user, session } = await validateSession(token);
  if (!session || user.role !== "admin") {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }

  setSessionCookie(res, token, session.expires_at);

  // Use a left join with count aggregation to get all users with their session counts
  const usersWithSessionActive = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      password: usersTable.password,
      role: usersTable.role,
      active:
        sql<boolean>`CASE WHEN COUNT(${sessionsTable.id}) > 0 THEN TRUE ELSE FALSE END`.as(
          "active",
        ),
    })
    .from(usersTable)
    .leftJoin(sessionsTable, eq(usersTable.id, sessionsTable.user_id))
    .groupBy(usersTable.id);

  res.status(200).json({ success: true, data: usersWithSessionActive });

  return;
}
export async function createUser(req: Request, res: Response) {
  const token = getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({ error: "No active session found" });
    return;
  }

  const { user, session } = await validateSession(token);
  if (!session || user.role !== "admin") {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }
  setSessionCookie(res, token, session.expires_at);

  const {
    success,
    data: validatedUser,
    error,
  } = UserInsertSchema.safeParse(req.body);
  if (!success) {
    logger.error(error);
    res.status(400).send({ error: "Invalid credentials" });
    return;
  }

  const users = await db
    .select({ username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.username, validatedUser.username));

  if (users.length > 0) {
    res.status(409).send({ error: "User already exists" });
    return;
  }

  validatedUser.password = await password.hash(
    validatedUser.password,
    "bcrypt",
  );

  const result = await db
    .insert(usersTable)
    .values(validatedUser as UserInsert)
    .returning()
    .catch((error) => {
      logger.error(error);
      res.status(500).send({ message: "Internal Server Error" });
      return;
    });

  res.status(201).send({ message: "User created", data: result });
  return;
}

export async function updateUser(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  if (!token) {
    res.status(307).send({ message: "No active session found" });
    return;
  }

  const { user, session } = await validateSession(token);
  if (!session || user.role !== "admin") {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }

  setSessionCookie(res, token, session.expires_at);

  const id: number = Number(req.params.id);
  const {
    success,
    data: validatedUser,
    error,
  } = UserUpdateSchema.safeParse(req.body);
  if (!success || isNaN(id)) {
    res.status(400).send({ message: "Invalid credentials" });
    logger.error(error);
    return;
  }

  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));

  if (result.length < 1) {
    res.status(404).send({ message: "User not found" });
    return;
  }

  if (validatedUser.password) {
    if (validatedUser.password !== result[0].password) {
      validatedUser.password = await password.hash(
        validatedUser?.password,
        "bcrypt",
      );
    }
  }

  const data = await db
    .update(usersTable)
    .set({ ...result[0], ...validatedUser })
    .where(eq(usersTable.id, id))
    .returning()
    .catch((error) => {
      res.status(500).send({ message: "Internal server error" });
      logger.error(error);
      return;
    });
  res.status(200).send({ message: "Updated User", data });
  return;
}

export async function deleteUser(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  if (!token) {
    res.status(307).send({ message: "No active session found" });
    return;
  }

  const { user, session } = await validateSession(token);
  if (!session || user.role !== "admin") {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }

  setSessionCookie(res, token, session.expires_at);
  const id: number = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).send({ message: "Invalid credentials" });
    return;
  }

  try {
    await db.delete(sessionsTable).where(eq(sessionsTable.user_id, id));
    await db.delete(usersTable).where(eq(usersTable.id, id));
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
    logger.error(error);
    return;
  }

  res.status(200).send({ message: "User Deleted" });
  return;
}

export async function logoutUser(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  if (!token) {
    res.status(307).send({ message: "No active session found" });
    return;
  }

  const { session, user } = await validateSession(token);
  if (!session || user.role !== "admin") {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }

  const id: number = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).send({ message: "Invalid credentials" });
    return;
  }

  await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.user_id, id))
    .catch((error) => {
      res.status(500).send({ message: "Internal server error" });
      logger.error(error);
      return;
    });

  res.status(200).send({ message: "User Logged Out" });
  return;
}
