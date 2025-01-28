import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { sessionTable, userTable } from "../db/schema";
import type { Session, User } from "../utils/types";
import type { Request, Response } from "express";

export function generateToken() {
  return randomBytes(20).toString("base64");
}

export async function createSession(token: string, userId: number) {
  const sessionId = await bcrypt.hash(token, 10);

  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };

  await db.insert(sessionTable).values(session);
  return session;
}

export async function validateSession(token: string) {
  const sessionId = await bcrypt.hash(token, 10);

  const result = await db
    .select({ user: userTable, session: sessionTable })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .where(eq(sessionTable.id, sessionId));

  if (result.length < 0) return { user: null, session: null };
  const { user, session } = result[0];

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return { session: null, user: null };
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionTable.id, session.id));
  }

  return { session, user };
}

export async function invalidateSession(sessionId: string) {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
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
    secure: false, // true in production
  });
}

export function deleteSessionCookie(res: Response) {
  res.clearCookie("session");
}
