import Router, { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { db, users } from "../db";
import { eq } from "drizzle-orm";
import * as lib from "../utils/session";
import * as err from "../utils/error";
import { userSchema } from "../utils/validation";

const router = Router();

router.post("/auth/register", async (req: Request, res: Response) => {
  const token = lib.getSessionFromCookie(req);
  if (token) {
    const { session } = await lib.validateSession(token);
    if (session) {
      res.status(307).send(err.SESSION_COOKIE_FOUND);
      return;
    }
  }

  const { success, data, error } = await userSchema.safeParseAsync(req.body);
  if (!success) {
    console.error(error);
    res.status(400).send(err.INVALID_CREDENTIALS);
    return;
  }

  const query = await db
    .select()
    .from(users)
    .where(eq(users.username, data.username));
  if (query.length > 0) {
    res.status(409).send(err.USER_FOUND);
    return;
  }

  data.password = await bcrypt.hash(data.password, 10);

  await db
    .insert(users)
    .values({ ...data, isAdmin: false })
    .catch((error) => {
      console.error(error);
      res.status(500).send(err.INTERNAL_SERVER_ERROR);
      return;
    });

  res.sendStatus(201);
  return;
});

router.post("/auth/login", async (req: Request, res: Response) => {
  const token = lib.getSessionFromCookie(req);
  if (token) {
    const { session } = await lib.validateSession(token);
    if (session) {
      res.status(307).send(err.SESSION_COOKIE_FOUND);
      return;
    }
  }

  const { success, data, error } = await userSchema.safeParseAsync(req.body);
  if (!success) {
    console.log(error);
    res.status(400).send(err.INVALID_CREDENTIALS);
    return;
  }

  const query = await db
    .select()
    .from(users)
    .where(eq(users.username, data.username));
  if (query.length < 1) {
    res.status(404).send(err.USER_NOT_FOUND);
    return;
  }

  const user = query[0];
  const passwordsMatch = await bcrypt.compare(data.password, user.password);
  if (!passwordsMatch) {
    res.status(400).send(err.INVALID_CREDENTIALS);
    return;
  }

  const newToken = lib.generateToken();
  const session = await lib.createSession(newToken, user.id);
  lib.setSessionCookie(res, newToken, session.expiresAt);

  res.status(200).send(user);
  return;
});

router.delete("/auth/logout", async (req: Request, res: Response) => {
  const token = lib.getSessionFromCookie(req);
  if (!token) {
    res.status(307).send(err.SESSION_COOKIE_NOT_FOUND);
    return;
  }

  await lib.invalidateSession(token);
  lib.deleteSessionCookie(res);

  res.sendStatus(200);
  return;
});

router.get("/auth/me", async (req: Request, res: Response) => {
  const token = lib.getSessionFromCookie(req);
  if (!token) {
    res.status(307).send(err.SESSION_COOKIE_NOT_FOUND);
    return;
  }

  const { user } = await lib.validateSession(token);

  if (!user) {
    res.status(404).send(err.USER_NOT_FOUND);
    return;
  }

  res.status(200).send(user);
  return;
});

export default router;
