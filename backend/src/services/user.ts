import { type Request, type Response } from "express";
import * as lib from "@/utils/session";
import { db } from "@/db";
import { sessionsTable, usersTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { User } from "@/utils/validation";
import { Error } from "@/utils/error";
import { password } from "bun";
import logger from "@/utils/logger";

const UserCreation = User.omit({ id: true });

export async function getUsers(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({
      success: false,
      message: Error.SESSION_NOT_FOUND,
    });

    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session || user.role !== "admin") {
    res.status(401).send({
      success: false,
      message: Error.UNAUTHORIZED,
    });

    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);

  const users = await db.select().from(usersTable);

  res.status(200).json({ success: true, data: users });

  return;
}

export async function getUsersWithSessions(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({
      success: false,
      message: Error.SESSION_NOT_FOUND,
    });

    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session || user.role !== "admin") {
    res.status(401).send({
      success: false,
      message: Error.UNAUTHORIZED,
    });

    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);

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
    .leftJoin(sessionsTable, eq(usersTable.id, sessionsTable.userId))
    .groupBy(usersTable.id);

  res.status(200).json({ success: true, data: usersWithSessionActive });

  return;
}
export async function createUser(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({
      success: false,
      message: Error.SESSION_NOT_FOUND,
    });

    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session || user.role !== "admin") {
    res.status(401).send({
      success: false,
      message: Error.UNAUTHORIZED,
    });

    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);

  const { success, data, error } = await UserCreation.safeParseAsync(req.body);

  if (!success) {
    logger.error(error);
    res.status(400).send({
      success: false,
      message: Error.INVALID_CREDENTIALS,
    });

    return;
  }

  const users = await db
    .select({ username: usersTable.username })
    .from(usersTable)
    .where(eq(usersTable.username, data.username));

  if (users.length > 0) {
    res.status(409).send({
      success: false,
      message: Error.USER_FOUND,
    });

    return;
  }

  data.password = await password.hash(data.password, "bcrypt");

  const result = await db
    .insert(usersTable)
    .values(data as User)
    .returning()
    .catch((error) => {
      logger.error(error);
      res.status(500).send({
        success: false,
        message: Error.INTERNAL_SERVER_ERROR,
      });

      return;
    });

  res.status(201).send({
    success: true,
    message: "User created",
    data: result,
  });

  return;
}

export async function updateUser(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({
      success: false,
      message: Error.SESSION_NOT_FOUND,
    });

    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session || user.role !== "admin") {
    res.status(401).send({
      success: false,
      message: Error.UNAUTHORIZED,
    });

    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);

  const id: number = Number(req.params.id);
  const { success, data, error } = await User.safeParseAsync(req.body);

  if (!success || isNaN(id)) {
    res.status(400).send({
      success: false,
      message: Error.INVALID_CREDENTIALS,
    });

    logger.error(error);
    return;
  }

  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));

  if (result.length < 1) {
    res.status(404).send({
      success: false,
      message: Error.USER_NOT_FOUND,
    });

    return;
  }

  if (data.password !== result[0].password) {
    data.password = await password.hash(data?.password, "bcrypt");
  }

  await db
    .update(usersTable)
    .set({ ...result[0], ...data })
    .where(eq(usersTable.id, id))
    .catch((error) => {
      res.status(500).send({
        success: false,
        message: Error.INTERNAL_SERVER_ERROR,
      });
      logger.error(error);

      return;
    });

  res.status(200).send({
    success: true,
    message: "Updated User",
  });

  return;
}

export async function deleteUser(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({
      success: false,
      message: Error.SESSION_NOT_FOUND,
    });

    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session || user.role !== "admin") {
    res.status(401).send({
      success: false,
      message: Error.UNAUTHORIZED,
    });

    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);
  const id: number = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).send({
      success: false,
      message: Error.INVALID_CREDENTIALS,
    });

    return;
  }

  try {
    await db.delete(sessionsTable).where(eq(sessionsTable.userId, id));
    await db.delete(usersTable).where(eq(usersTable.id, id));
  } catch (error) {
    res.status(500).send({
      success: false,
      message: Error.INTERNAL_SERVER_ERROR,
    });

    logger.error(error);
    return;
  }

  res.status(200).send({
    success: true,
    message: "User Deleted",
  });

  return;
}

export async function logoutUser(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({
      success: false,
      message: Error.SESSION_NOT_FOUND,
    });

    return;
  }

  const { session, user } = await lib.validateSession(token);

  if (!session || user.role !== "admin") {
    res.status(401).send({
      success: false,
      message: Error.UNAUTHORIZED,
    });

    return;
  }

  const id: number = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).send({
      success: false,
      message: Error.INVALID_CREDENTIALS,
    });

    return;
  }

  await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.userId, id))
    .catch((error) => {
      res.status(500).send({
        success: false,
        message: Error.INTERNAL_SERVER_ERROR,
      });

      logger.error(error);
      return;
    });

  res.status(200).send({
    success: true,
    message: "User Logged Out",
  });

  return;
}
