import { Router, type Request, type Response } from "express";
import * as lib from "../utils/session";
import { db, users, sessions } from "../db";
import { userSchema, userUpdateSchema } from "../utils/validation";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import type { User } from "../utils/types";
import * as err from "../utils/error";

const router = Router();

// List All
router.get("/api/users", async (req: Request, res: Response) => {
  const token = lib.getSessionFromCookie(req);
  if (!token) {
    res.status(307).send(err.SESSION_COOKIE_NOT_FOUND);
    return;
  }

  const { user, session } = await lib.validateSession(token);
  if (!session || !user.isAdmin) {
    res.status(401).send(err.UNAUTHORIZED);
    return;
  }
  lib.setSessionCookie(res, token, session.expiresAt);

  const limit = Number(req.query.limit);
  const query = await db
    .select()
    .from(users)
    .limit(limit || -1);

  res.status(200).send(query);
  return;
});

// Create
router.post("/api/users", async (req: Request, res: Response) => {
  const token = lib.getSessionFromCookie(req);
  if (!token) {
    res.status(307).send(err.SESSION_COOKIE_NOT_FOUND);
    return;
  }

  const { user, session } = await lib.validateSession(token);
  if (!session || !user.isAdmin) {
    res.status(401).send(err.UNAUTHORIZED);
    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);
  const { success, data, error } = await userSchema.safeParseAsync(
    req.body as User,
  );
  if (!success) {
    console.error(error);
    res.status(400).send(err.INVALID_CREDENTIALS);
    return;
  }

  const query = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.username, data.username));
  if (query.length > 0) {
    res.status(409).send(err.USER_FOUND);
    return;
  }

  data.password = await bcrypt.hash(data.password, 10);

  await db
    .insert(users)
    .values(data as User)
    .catch((error) => {
      console.error(error);
      res.status(500).send(err.INTERNAL_SERVER_ERROR);
      return;
    });

  res.sendStatus(201);
  return;
});

// Update
router.patch("/api/users/:id", async (req: Request, res: Response) => {
  const token = lib.getSessionFromCookie(req);
  if (!token) {
    res.status(307).send(err.SESSION_COOKIE_NOT_FOUND);
    return;
  }

  const { user, session } = await lib.validateSession(token);
  if (!session || !user.isAdmin) {
    res.status(401).send(err.UNAUTHORIZED);
    return;
  }
  lib.setSessionCookie(res, token, session.expiresAt);

  const id: number = Number(req.params.id);
  const { success, data, error } = await userUpdateSchema.safeParseAsync(
    req.body as User,
  );

  if (!success || isNaN(id)) {
    console.error(error);
    res.status(400).send(err.INVALID_CREDENTIALS);
    return;
  }

  const query = await db.select().from(users).where(eq(users.id, id));
  if (query.length < 1) {
    res.status(404).send(err.USER_FOUND);
    return;
  }

  const password = data?.password ?? null;
  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }

  await db
    .update(users)
    .set({ ...query[0], ...data })
    .where(eq(users.id, id))
    .catch((error) => {
      console.error(error);
      res.status(500).send(err.INTERNAL_SERVER_ERROR);
    });

  res.sendStatus(200);
  return;
});

// Delete
router.delete("/api/users/:id", async (req: Request, res: Response) => {
  const token = lib.getSessionFromCookie(req);
  if (!token) {
    res.status(307).send(err.SESSION_COOKIE_NOT_FOUND);
    return;
  }

  const { user, session } = await lib.validateSession(token);
  if (!session || !user.isAdmin) {
    res.status(401).send(err.UNAUTHORIZED);
    return;
  }
  lib.setSessionCookie(res, token, session.expiresAt);

  const id: number = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).send(err.INVALID_CREDENTIALS);
    return;
  }

  try {
    await db.delete(sessions).where(eq(sessions.userId, id));
    await db.delete(users).where(eq(users.id, id));
  } catch (error) {
    console.error(error);
    res.status(500).send(err.INTERNAL_SERVER_ERROR);
    return;
  }

  res.sendStatus(200);
  return;
});

// Logout
router.delete("/api/users/logout/:id", async (req: Request, res: Response) => {
  const token = lib.getSessionFromCookie(req);
  if (!token) {
    res.status(307).send(err.SESSION_COOKIE_NOT_FOUND);
    return;
  }

  const { session, user } = await lib.validateSession(token);
  if (!session || !user.isAdmin) {
    res.status(401).send(err.UNAUTHORIZED);
    return;
  }

  const id: number = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).send(err.INVALID_CREDENTIALS);
    return;
  }

  await db
    .delete(sessions)
    .where(eq(sessions.userId, id))
    .catch((error) => {
      console.error(error);
      res.status(500).send(err.INTERNAL_SERVER_ERROR);
      return;
    });

  res.sendStatus(200);
  return;
});

export default router;
