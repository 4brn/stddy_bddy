import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usersTable, sessionsTable, type Session } from "@/db/schema";
import type { Response, Request } from "express";

const DAY_IN_MILLIS = 1000 * 60 * 60 * 24;

export function generateToken() {
  return randomBytes(16).toString("hex");
}

export async function createSession(token: string, userId: number) {
  const session: Session = {
    id: token,
    userId: userId,
    expiresAt: new Date(Date.now() + DAY_IN_MILLIS * 1),
  };

  await db.insert(sessionsTable).values(session);

  return session;
}

export async function validateSession(token: string) {
  const result = await db
    .select({ user: usersTable, session: sessionsTable })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(eq(sessionsTable.id, token));

  if (result.length < 1) return { session: null, user: null };

  const { user, session } = result[0];
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id));

    return { session: null, user: null };
  }

  if (Date.now() >= session.expiresAt.getTime() - DAY_IN_MILLIS * 3) {
    session.expiresAt = new Date(Date.now() + DAY_IN_MILLIS * 1);
    await db
      .update(sessionsTable)
      .set({ expiresAt: session.expiresAt })
      .where(eq(sessionsTable.id, session.id));
  }

  return { session, user };
}

export async function invalidateSession(token: string) {
  await db.delete(sessionsTable).where(eq(sessionsTable.id, token));
}

export function setSessionCookie(
  res: Response,
  token: string,
  expiresAt: Date,
) {
  res.cookie("session", token, {
    httpOnly: true,
    // sameSite: "lax",
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
