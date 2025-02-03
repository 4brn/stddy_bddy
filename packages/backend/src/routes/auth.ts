import bcrypt from "bcrypt";
import Router, { type Request, type Response } from "express";
import { db, users } from "../db";
import { eq } from "drizzle-orm";
import * as lib from "../utils/session";
import { userSchema } from "../utils/validation";

const router = Router();

router.post("/api/auth/signup", async (req: Request, res: Response) => {
  const token = lib.getSessionFromCookie(req);
  if (token) {
    const { session } = await lib.validateSession(token);
    if (session) {
      res.status(409).send({ error: "SESSION_FOUND" });
      return;
    }
  }

  const { success, data, error } = await userSchema.safeParseAsync(req.body);
  if (!success) {
    console.error(error);
    res.status(400).send({ error: "INVALID_CREDENTIALS" });
    return;
  }

  const query = await db
    .select()
    .from(users)
    .where(eq(users.username, data.username));
  if (query.length > 0) {
    res.status(409).send({ error: "USER_EXISTS" });
    return;
  }

  data.password = await bcrypt.hash(data.password, 10);

  await db
    .insert(users)
    .values({ ...data, isAdmin: false })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ error: "INTERNAL_SERVER_ERROR" });
      return;
    });

  res.sendStatus(200);
  return;
});

router.post("/api/auth/login", async (req: Request, res: Response) => {
  const token = lib.getSessionFromCookie(req);
  if (token) {
    const { session } = await lib.validateSession(token);
    if (session) {
      res.status(409).send({ error: "SESSION_FOUND" });
      return;
    }
  }

  const { success, data, error } = await userSchema.safeParseAsync(req.body);
  if (!success) {
    console.log(error);
    res.status(400).send({ error: "INVALID_CREDENTIALS" });
    return;
  }

  const query = await db
    .select()
    .from(users)
    .where(eq(users.username, data.username));
  if (query.length < 1) {
    res.status(404).send({ error: "NOT_FOUND" });
    return;
  }

  const user = query[0];
  const passwordsMatch = await bcrypt.compare(data.password, user.password);
  if (!passwordsMatch) {
    res.status(401).send({ error: "INVALID_CREDENTIALS" });
    return;
  }

  const newToken = lib.generateToken();
  const session = await lib.createSession(newToken, user.id);
  lib.setSessionCookie(res, newToken, session.expiresAt);

  res.sendStatus(200);
  return;
});

router.post("/api/auth/logout", async (req: Request, res: Response) => {
  const token = lib.getSessionFromCookie(req);
  if (!token) {
    res.status(409).send({ error: "SESSION_NOT_FOUND" });
    return;
  }

  await lib.invalidateSession(token);
  lib.deleteSessionCookie(res);

  res.sendStatus(200);
  return;
});

export default router;
