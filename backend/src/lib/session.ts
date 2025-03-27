import { randomBytes } from "crypto";
import { db, usersTable, sessionsTable } from "@/db";
import { eq } from "drizzle-orm";
import type { SessionInsert } from "@shared/types";
import type { Response, Request } from "express";

const DAY_IN_MILLIS = 1000 * 60 * 60 * 24;

export function generateToken() {
  return randomBytes(16).toString("hex");
}

export async function createSession(token: string, userId: number) {
  const session: SessionInsert = {
    id: token,
    user_id: userId,
    expires_at: new Date(Date.now() + DAY_IN_MILLIS * 1),
  };

  await db.insert(sessionsTable).values(session).returning();

  return session;
}

export async function validateSession(token: string) {
  const result = await db
    .select({ user: usersTable, session: sessionsTable })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.user_id, usersTable.id))
    .where(eq(sessionsTable.id, token));

  if (result.length < 1) return { session: null, user: null };

  const { user, session } = result[0];
  if (Date.now() >= session.expires_at.getTime()) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id));

    return { session: null, user: null };
  }

  if (Date.now() >= session.expires_at.getTime() - DAY_IN_MILLIS * 3) {
    session.expires_at = new Date(Date.now() + DAY_IN_MILLIS * 1);
    await db
      .update(sessionsTable)
      .set({ expires_at: session.expires_at })
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
    sameSite: "none", // "lax" for production
    expires: expiresAt,
    path: "/",
    secure: true, // true for production
  });
}

export function deleteSessionCookie(res: Response) {
  res.clearCookie("session");
}

export function getSessionFromCookie(req: Request): string | null {
  const token: string = req.cookies?.session ?? null;

  return token;
}
