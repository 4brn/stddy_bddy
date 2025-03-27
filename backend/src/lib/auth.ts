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
import type { UserInsert } from "@shared/types";

export async function handleRegister(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  if (token) {
    const { session } = await validateSession(token);
    if (session) {
      res.status(307).send({ error: "Active session found" });
      return;
    }
  }

  const user: UserInsert = { ...req.body, role: "user" };
  const {
    success,
    data: validatedUser,
    error,
  } = UserValidationSchema.insert.safeParse(user);

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
    .where(eq(usersTable.username, validatedUser.username))
    .limit(1);
  if (query.length !== 0) {
    res.status(409).send({ error: "User found" });
    return;
  }

  validatedUser.password = await password.hash(
    validatedUser.password,
    "bcrypt",
  );

  await db
    .insert(usersTable)
    .values(validatedUser)
    .catch((error) => {
      res.status(500).send({
        error: "Internal server error",
      });
      logger.error(error);
      return;
    });

  res.status(201).send({ message: "Registered" });
  logger.info("Registered: ", validatedUser);
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

  const {
    success,
    data: validatedUser,
    error,
  } = UserValidationSchema.insert.partial({ role: true }).safeParse(req.body);

  if (!success) {
    res.status(400).send({ error: "Invalid credentials" });
    logger.error(error);
    return;
  }

  const query = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, validatedUser.username));
  if (query.length !== 1) {
    res.status(404).send({ error: "User not found" });
    return;
  }

  const user = query[0];
  const passwordsMatch = await Bun.password.verify(
    validatedUser.password,
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

  res.status(200).send({ data: user });
  logger.info(`Logged in: `, user.id, user.username, user.role);
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

  res.status(200).send({ data: user });
  return;
}
