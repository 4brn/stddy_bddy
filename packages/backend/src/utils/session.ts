import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db, sessions, users } from "../db";
import { type Session, DAY_IN_MILLIS } from "../utils/types";
import type { Response, Request } from "express";

export function generateToken() {
  return randomBytes(16).toString("hex");
}

export async function createSession(token: string, userId: number) {
  const session: Session = {
    id: token,
    userId: userId,
    expiresAt: new Date(Date.now() + DAY_IN_MILLIS * 7),
  };

  await db.insert(sessions).values(session);
  return session;
}

export async function validateSession(token: string) {
  const result = await db
    .select({ user: users, session: sessions })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, token));

  if (result.length < 1) return { user: null, session: null };

  const { user, session } = result[0];
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return { user: null, session: null };
  }

  if (Date.now() >= session.expiresAt.getTime() - DAY_IN_MILLIS * 3) {
    session.expiresAt = new Date(Date.now() + DAY_IN_MILLIS * 7);
    await db
      .update(sessions)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessions.id, session.id));
  }

  return { user, session };
}

export async function invalidateSession(token: string) {
  await db.delete(sessions).where(eq(sessions.id, token));
}

export function setSessionCookie(
  res: Response,
  token: string,
  expiresAt: Date,
) {
  res.cookie("session", token, {
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
    secure: false, // true for production
  });
}

export function deleteSessionCookie(res: Response) {
  res.clearCookie("session");
}

export function getSessionFromCookie(req: Request): string | null {
  const token: string = req.cookies?.session ?? null;
  return token;
}
