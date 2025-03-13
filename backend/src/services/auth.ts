import { type Request, type Response } from "express";
import { password } from "bun";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import * as lib from "@/utils/session";
import { Error } from "@/utils/error";
import { User } from "@/utils/validation";
import logger from "@/utils/logger";

const AuthUser = User.omit({ role: true, id: true });

export async function handleRegister(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  // Session Validation
  if (token) {
    const { session } = await lib.validateSession(token);
    if (session) {
      res.status(307).send({
        success: false,
        error: Error.SESSION_FOUND,
      });

      return;
    }
  }

  // Input Validation
  const { success, data, error } = await AuthUser.safeParseAsync(req.body);

  if (!success) {
    res.status(400).send({
      success: false,
      error: Error.INVALID_CREDENTIALS,
    });

    logger.error(error);

    return;
  }

  // User Validation
  const query = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, data.username))
    .limit(1);

  if (query.length !== 0) {
    res.status(409).send({
      success: false,
      error: Error.USER_FOUND,
    });

    return;
  }

  data.password = await password.hash(data.password, "bcrypt");

  // Insert to DB
  await db
    .insert(usersTable)
    .values({ ...data, role: "user" })
    .catch((error) => {
      res.status(500).send({
        success: false,
        error: Error.INTERNAL_SERVER_ERROR,
      });

      logger.error(error);
      return;
    });

  res.status(201).send({ success: true, message: "Registered" });

  logger.info("Registered: ", { ...data, role: "user" });
  return;
}

export async function handleLogin(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  if (token) {
    const { session } = await lib.validateSession(token);
    if (session) {
      res.status(307).send({
        success: false,
        error: Error.SESSION_FOUND,
      });

      return;
    }
  }

  const { success, data, error } = await AuthUser.safeParseAsync(req.body);

  if (!success) {
    res.status(400).send({
      success: false,
      error: Error.INVALID_CREDENTIALS,
    });

    logger.error(error);

    return;
  }

  const query = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, data.username));

  if (query.length !== 1) {
    res.status(404).send({
      status: false,
      error: Error.USER_NOT_FOUND,
    });

    return;
  }

  const user = query[0];

  const passwordsMatch = await password.verify(data.password, user.password);

  if (!passwordsMatch) {
    res.status(400).send({
      success: false,
      error: Error.INVALID_CREDENTIALS,
    });

    return;
  }

  const newToken = lib.generateToken();
  const session = await lib.createSession(newToken, user.id);
  lib.setSessionCookie(res, newToken, session.expiresAt);

  res.status(200).send({
    success: true,
    data: user,
    message: "Logged In",
  });

  logger.info(`Logged in: ${user.username}`);
  return;
}

export async function handleLogout(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({
      success: false,
      error: Error.SESSION_NOT_FOUND,
    });

    return;
  }

  await lib.invalidateSession(token);
  lib.deleteSessionCookie(res);

  res.status(200).send({
    success: true,
    message: "Logged out",
  });

  logger.info(`Logged out: ${token}`);
  return;
}

export async function handleMe(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({
      success: false,
      error: Error.SESSION_NOT_FOUND,
    });

    return;
  }

  const { user } = await lib.validateSession(token);

  if (!user) {
    res.status(404).send({
      success: false,
      error: Error.USER_NOT_FOUND,
    });

    return;
  }

  res.status(200).send({
    success: true,
    data: user,
  });

  return;
}
