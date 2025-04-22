import { type Request, type Response } from "express";
import { db, testsTable, likesTable } from "@/db";
import { and, eq } from "drizzle-orm";
import { logger } from "@/utils/logger";
import {
  getSessionFromCookie,
  setSessionCookie,
  validateSession,
} from "@/lib/session";

// Like or unlike a test
export async function Like(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  const testId = Number(req.params.id);

  if (isNaN(testId)) {
    res.status(400).send({ error: "Invalid test id" });
    return;
  }

  if (!token) {
    res.status(307).send({ error: "Session expired" });
    return;
  }

  const { user, session } = await validateSession(token);

  if (!session) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }

  setSessionCookie(res, token, session.expires_at);

  // Verify the test exists
  const existingTest = await db
    .select()
    .from(testsTable)
    .where(eq(testsTable.id, testId))
    .limit(1);

  if (existingTest.length === 0) {
    res.status(404).send({ error: "Test not found" });
    return;
  }

  // Check if the test is private and user is not the owner or admin
  if (existingTest[0].is_private && user.role !== "admin") {
    res.status(403).send({ error: "Forbidden" });
    return;
  }

  try {
    // Check if user already liked this test
    const existingLike = await db
      .select()
      .from(likesTable)
      .where(
        and(eq(likesTable.test_id, testId), eq(likesTable.user_id, user.id)),
      )
      .limit(1);

    let message;

    if (existingLike.length > 0) {
      res.status(200).send({ message: "already liked" });
      return;
    }

    // Like: Add a new like
    await db.insert(likesTable).values({
      test_id: testId,
      user_id: user.id,
    });
    message = "Test liked";

    res.sendStatus(200);
    logger.info(`${message}: Test ${testId} by user ${user.id}`);
    return;
  } catch (dbError) {
    logger.error(dbError);
    res.status(500).send({ error: "Internal server error" });
    return;
  }
}

export async function Dislike(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  const testId = Number(req.params.id);

  if (isNaN(testId)) {
    res.status(400).send({ error: "Invalid test id" });
    return;
  }

  if (!token) {
    res.status(307).send({ error: "Session expired" });
    return;
  }

  const { user, session } = await validateSession(token);

  if (!session) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }

  setSessionCookie(res, token, session.expires_at);

  // Verify the test exists
  const existingTest = await db
    .select()
    .from(testsTable)
    .where(eq(testsTable.id, testId))
    .limit(1);

  if (existingTest.length === 0) {
    res.status(404).send({ error: "Test not found" });
    return;
  }

  if (existingTest[0].is_private && user.role !== "admin") {
    res.status(403).send({ error: "Forbidden" });
    return;
  }

  try {
    // Check if user already liked this test
    const existingLike = await db
      .select()
      .from(likesTable)
      .where(
        and(eq(likesTable.test_id, testId), eq(likesTable.user_id, user.id)),
      )
      .limit(1);

    if (existingLike.length < 1) {
      res.sendStatus(200);
      return;
    }

    // Like: Add a new like
    await db.delete(likesTable).where(eq(likesTable.id, existingLike[0].id));

    res.sendStatus(200);
    logger.info(`Test ${testId} disliked by user ${user.id}`);
    return;
  } catch (dbError) {
    logger.error(dbError);
    console.log("here");
    res.status(500).send({ error: "Internal server error" });
    return;
  }
}

// Get count of likes for a test
export async function getLikes(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  const testId = Number(req.params.id);

  if (isNaN(testId)) {
    res.status(400).send({ error: "Invalid test id" });
    return;
  }

  if (!token) {
    res.status(307).send({ error: "Session expired" });
    return;
  }

  const { session } = await validateSession(token);

  if (!session) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }

  setSessionCookie(res, token, session.expires_at);

  // Verify the test exists
  const existingTest = await db
    .select()
    .from(testsTable)
    .where(eq(testsTable.id, testId))
    .limit(1);

  if (existingTest.length === 0) {
    res.status(404).send({ error: "Test not found" });
    return;
  }

  try {
    // Count likes for this test
    const likes = await db
      .select()
      .from(likesTable)
      .where(eq(likesTable.test_id, testId));

    res.status(200).send({ data: likes });
    return;
  } catch (dbError) {
    logger.error(dbError);
    res.status(500).send({
      error: "Internal server error",
    });
    return;
  }
}

export async function getIsTestLikedByUser(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  const testId = Number(req.params.id);

  if (isNaN(testId)) {
    res.status(400).send({ error: "Invalid test id" });
    return;
  }

  if (!token) {
    res.status(307).send({ error: "Session expired" });
    return;
  }

  const { user, session } = await validateSession(token);

  if (!session) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }

  setSessionCookie(res, token, session.expires_at);

  // Verify the test exists
  const existingTest = await db
    .select()
    .from(testsTable)
    .where(eq(testsTable.id, testId))
    .limit(1);

  if (existingTest.length === 0) {
    res.status(404).send({ error: "Test not found" });
    return;
  }

  try {
    // Count likes for this test
    const like = await db
      .select()
      .from(likesTable)
      .where(
        and(eq(likesTable.user_id, user.id), eq(likesTable.test_id, testId)),
      );

    res.status(200).send(like.length > 0 ? true : false);
    return;
  } catch (dbError) {
    logger.error(dbError);
    res.status(500).send({
      error: "Internal server error",
    });
    return;
  }
}
