import { categoriesTable, db } from "@/db";
import {
  getSessionFromCookie,
  setSessionCookie,
  validateSession,
} from "./session";
import type { Request, Response } from "express";

export async function getCategories(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  if (!token) {
    res.status(307).send({ error: "No active session found" });
    return;
  }

  const { session } = await validateSession(token);
  if (!session) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }
  setSessionCookie(res, token, session.expires_at);

  const categories = await db.select().from(categoriesTable);
  res.status(200).json({ data: categories });
  return;
}
