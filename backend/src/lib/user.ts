import { type Request, type Response } from "express";
import * as lib from "../utils/session";
import { db, usersTable, sessionsTable } from "../db";
import { eq } from "drizzle-orm";
import { User } from "../utils/validation";
import { Error } from "../utils/error";
import { password } from "bun";
import logger from "@/utils/logger";

export async function getUsers(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({
      success: false,
      error: Error.SESSION_NOT_FOUND,
    });

    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session || user.role !== "admin") {
    res.status(401).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });

    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);

  const users = await db.select().from(usersTable);

  res.status(200).send({ success: true, data: users });

  return;
}

export async function createUser(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({
      success: false,
      error: Error.SESSION_NOT_FOUND,
    });

    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session || user.role !== "admin") {
    res.status(401).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });

    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);

  const { success, data, error } = await User.safeParseAsync(req.body as User);

  if (!success) {
    logger.error(error);
    res.status(400).send({
      success: false,
      error: Error.INVALID_CREDENTIALS,
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
      error: Error.USER_FOUND,
    });

    return;
  }

  data.password = await password.hash(data.password, "bcrypt");

  await db
    .insert(usersTable)
    .values(data as User)
    .catch((error) => {
      logger.error(error);
      res.status(500).send({
        success: false,
        error: Error.INTERNAL_SERVER_ERROR,
      });

      return;
    });

  res.status(201).send({
    success: true,
    message: "User created",
  });

  return;
}

export async function updateUser(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({
      success: false,
      error: Error.SESSION_NOT_FOUND,
    });

    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session || user.role !== "admin") {
    res.status(401).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });

    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);

  const id: number = Number(req.params.id);
  const { success, data, error } = await User.partial().safeParseAsync(
    req.body,
  );

  if (!success || isNaN(id)) {
    res.status(400).send({
      success: false,
      error: Error.INVALID_CREDENTIALS,
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
      error: Error.USER_NOT_FOUND,
    });

    return;
  }

  if (data.password) {
    data.password = await password.hash(data?.password, "bcrypt");
  }

  await db
    .update(usersTable)
    .set({ ...result[0], ...data })
    .where(eq(usersTable.id, id))
    .catch((error) => {
      res.status(500).send({
        success: false,
        error: Error.INTERNAL_SERVER_ERROR,
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
      error: Error.SESSION_NOT_FOUND,
    });

    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session || user.role !== "admin") {
    res.status(401).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });

    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);
  const id: number = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).send({
      success: false,
      error: Error.INVALID_CREDENTIALS,
    });

    return;
  }

  try {
    await db.delete(sessionsTable).where(eq(sessionsTable.userId, id));
    await db.delete(usersTable).where(eq(usersTable.id, id));
  } catch (error) {
    res.status(500).send({
      success: false,
      error: Error.INTERNAL_SERVER_ERROR,
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
      error: Error.SESSION_NOT_FOUND,
    });

    return;
  }

  const { session, user } = await lib.validateSession(token);

  if (!session || user.role !== "admin") {
    res.status(401).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });

    return;
  }

  const id: number = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).send({
      success: false,
      error: Error.INVALID_CREDENTIALS,
    });

    return;
  }

  await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.userId, id))
    .catch((error) => {
      res.status(500).send({
        success: false,
        error: Error.INTERNAL_SERVER_ERROR,
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
