import { type Request, type Response } from "express";
import { password } from "bun";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usersTable, sessionsTable } from "@/db";
import {
  createSession,
  deleteSessionCookie,
  generateToken,
  getSessionFromCookie,
  invalidateSession,
  setSessionCookie,
  validateSession,
} from "@/lib/session";
import { UserValidationSchema } from "@shared/validation";
import { logger } from "@/utils/logger";
import type { UserInsert, UserContext } from "@shared/types";

export async function handleRegister(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  if (token) {
    const { session } = await validateSession(token);
    if (session) {
      res.status(307).send({ error: "Active session found" });
      return;
    }
  }

  const { success, data, error } = UserValidationSchema.insert
    .omit({ id: true, role: true })
    .safeParse({
      ...req.body,
    });

  if (!success) {
    res.status(400).send({
      error: "Validation error parsing request body",
    });
    logger.error(error);
    return;
  }

  const query = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, data.username))
    .limit(1);
  if (query.length !== 0) {
    res.status(409).send({ error: "User found" });
    return;
  }

  data.password = await password.hash(data.password, "bcrypt");

  const result = await db
    .insert(usersTable)
    .values(data)
    .returning()
    .catch((error) => {
      res.status(500).send({
        error: "Internal server error",
      });
      logger.error(error);
      return;
    });
  if (!result) {
    res.status(500).send({
      error: "Internal server error",
    });
    logger.error(error);
    return;
  }

  const newUser = result[0];
  const newToken = generateToken();
  const session = await createSession(newToken, newUser.id);
  setSessionCookie(res, newToken, session.expires_at);

  Reflect.deleteProperty(newUser, "password");
  res.status(201).send(newUser);
  logger.info(`Registered ${JSON.stringify(newUser)}`);
  return;
}

export async function handleLogin(req: Request, res: Response) {
  const token = getSessionFromCookie(req);

  if (token) {
    const { session } = await validateSession(token);
    if (session) {
      res.status(307).send({ error: "Active session found" });
      return;
    }
  }

  const { success, data, error } = UserValidationSchema.insert
    .omit({ role: true, id: true })
    .safeParse(req.body);

  if (!success) {
    res.status(400).send({ error: "Invalid credentials" });
    logger.error(error);
    return;
  }

  const query = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, data.username));
  if (query.length !== 1) {
    res.status(404).send({ error: "User not found" });
    return;
  }

  const user = query[0];
  const passwordsMatch = await Bun.password.verify(
    data.password,
    user.password,
    "bcrypt",
  );

  if (!passwordsMatch) {
    res.status(400).send({ error: "Invalid credentials" });
    return;
  }

  const newToken = generateToken();
  const session = await createSession(newToken, user.id);
  setSessionCookie(res, newToken, session.expires_at);

  Reflect.deleteProperty(user, "password");
  res.status(200).send({ data: user });
  logger.info(`Logged in as ${user.username}`);
  return;
}

export async function handleLogout(req: Request, res: Response) {
  const token = getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({ error: "No active session found" });
    return;
  }

  await invalidateSession(token);
  deleteSessionCookie(res);

  res.status(200).send({ message: "Logged out" });
  logger.info(`Logged out: ${token}`);
  return;
}

export async function handleMe(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  if (!token) {
    res.status(307).send({ error: "No active session found" });
    return;
  }

  const { user } = await validateSession(token);
  if (!user) {
    res.status(307).send({ error: "Expired session" });
    return;
  }

  Reflect.deleteProperty(user, "password");
  res.status(200).send(user);
  return;
}
