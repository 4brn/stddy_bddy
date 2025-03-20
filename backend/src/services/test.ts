// stddy_bddy/backend/src/services/test.ts
import { type Request, type Response } from "express";
import { db } from "@/db";
import * as lib from "@/utils/session";
import { testsTable, likesTable, TestSchema } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { type Test } from "@/utils/validation";
import { Error } from "@/utils/error";
import logger from "@/utils/logger";
import { z } from "zod";

// Get all tests (with privacy filter based on user role)
export async function getTests(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({
      success: false,
      error: Error.SESSION_NOT_FOUND,
    });
    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session) {
    res.status(401).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });
    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);

  let tests = await db.select().from(testsTable);

  // Filter private tests for non-admin users
  if (user.role === "user") {
    tests = tests.filter((test) => !test.isPrivate || test.ownerId === user.id);
  }

  res.status(200).send({
    success: true,
    data: tests,
  });
  return;
}

// Get a specific test by ID
export async function getTestById(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);
  const testId = Number(req.params.id);

  if (isNaN(testId)) {
    res.status(400).send({
      success: false,
      error: Error.INVALID_CREDENTIALS,
    });
    return;
  }

  if (!token) {
    res.status(307).send({
      success: false,
      error: Error.SESSION_NOT_FOUND,
    });
    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session) {
    res.status(401).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });
    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);

  const test = await db
    .select()
    .from(testsTable)
    .where(eq(testsTable.id, testId))
    .limit(1);

  if (test.length === 0) {
    res.status(404).send({
      success: false,
      error: Error.USER_NOT_FOUND, // Could define a more specific TEST_NOT_FOUND error
    });
    return;
  }

  // Check if user can access this test
  if (
    test[0].isPrivate &&
    user.role !== "admin" &&
    test[0].ownerId !== user.id
  ) {
    res.status(403).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });
    return;
  }

  res.status(200).send({
    success: true,
    data: test[0],
  });
  return;
}

// Create a new test
export async function createTest(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({
      success: false,
      error: Error.SESSION_NOT_FOUND,
    });
    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session) {
    res.status(401).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });
    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);

  const { success, data, error } = await TestSchema.safeParseAsync(req.body);

  if (!success) {
    logger.error(error);
    res.status(400).send({
      success: false,
      error: Error.INVALID_CREDENTIALS,
    });
    return;
  }

  // Set owner and timestamps
  const now = new Date();
  const testData = {
    ...data,
    ownerId: user.id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const result = await db
      .insert(testsTable)
      .values({
        title: testData.title,
        isPrivate: testData.isPrivate,
        content: testData.content as any,
        ownerId: testData.ownerId,
        createdAt: testData.createdAt,
        updatedAt: testData.updatedAt,
      })
      .returning();

    res.status(201).send({
      success: true,
      message: "Test created",
      data: result[0],
    });

    logger.info(`Test created: ${result[0].id} by user ${user.id}`);
    return;
  } catch (dbError) {
    logger.error(dbError);
    res.status(500).send({
      success: false,
      error: Error.INTERNAL_SERVER_ERROR,
    });
    return;
  }
}

// Update an existing test
export async function updateTest(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);
  const testId = Number(req.params.id);

  if (isNaN(testId)) {
    console.log("not number");
    res.status(400).send({
      success: false,
      error: Error.INVALID_CREDENTIALS,
    });
    return;
  }

  if (!token) {
    res.status(307).send({
      success: false,
      error: Error.SESSION_NOT_FOUND,
    });
    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session) {
    res.status(401).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });
    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);

  // Verify the test exists
  const existingTest = await db
    .select()
    .from(testsTable)
    .where(eq(testsTable.id, testId))
    .limit(1);

  if (existingTest.length === 0) {
    res.status(404).send({
      success: false,
      error: Error.USER_NOT_FOUND, // Could define a TEST_NOT_FOUND error
    });
    return;
  }

  // Check if user is authorized to update the test
  if (existingTest[0].ownerId !== user.id && user.role !== "admin") {
    res.status(403).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });
    return;
  }

  const TestApiSchema = TestSchema.extend({
    createdAt: z.string().transform((str) => new Date(str)),
    updatedAt: z.string().transform((str) => new Date(str)),
  });
  const { success, data, error } = await TestSchema.safeParseAsync(req.body);

  if (!success) {
    logger.error(error);
    res.status(400).send({
      success: false,
      error: Error.INVALID_CREDENTIALS,
    });
    return;
  }

  // Prepare update data, preserving ownerId and createdAt
  const updateData = {
    title: data.title,
    isPrivate: data.isPrivate,
    content: data.content as any,
    ownerId: existingTest[0].ownerId,
    createdAt: existingTest[0].createdAt,
    updatedAt: new Date(),
  };

  try {
    await db
      .update(testsTable)
      .set(updateData)
      .where(eq(testsTable.id, testId));

    res.status(200).send({
      success: true,
      message: "Test updated",
    });

    logger.info(`Test updated: ${testId} by user ${user.id}`);
    return;
  } catch (dbError) {
    logger.error(dbError);
    res.status(500).send({
      success: false,
      error: Error.INTERNAL_SERVER_ERROR,
    });
    return;
  }
}

// Delete a test
export async function deleteTest(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);
  const testId = Number(req.params.id);

  if (isNaN(testId)) {
    res.status(400).send({
      success: false,
      error: Error.INVALID_CREDENTIALS,
    });
    return;
  }

  if (!token) {
    res.status(307).send({
      success: false,
      error: Error.SESSION_NOT_FOUND,
    });
    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session) {
    res.status(401).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });
    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);

  // Verify the test exists
  const existingTest = await db
    .select()
    .from(testsTable)
    .where(eq(testsTable.id, testId))
    .limit(1);

  if (existingTest.length === 0) {
    res.status(404).send({
      success: false,
      error: Error.USER_NOT_FOUND, // Could define a more specific TEST_NOT_FOUND error
    });
    return;
  }

  // Check if user is authorized to delete the test
  if (existingTest[0].ownerId !== user.id && user.role !== "admin") {
    res.status(403).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });
    return;
  }

  try {
    // First delete any likes associated with this test
    await db.delete(likesTable).where(eq(likesTable.testId, testId));

    // Then delete the test
    await db.delete(testsTable).where(eq(testsTable.id, testId));

    res.status(200).send({
      success: true,
      message: "Test deleted",
    });

    logger.info(`Test deleted: ${testId} by user ${user.id}`);
    return;
  } catch (dbError) {
    logger.error(dbError);
    res.status(500).send({
      success: false,
      error: Error.INTERNAL_SERVER_ERROR,
    });
    return;
  }
}

// Get tests created by the current user
export async function getMyTests(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({
      success: false,
      error: Error.SESSION_NOT_FOUND,
    });
    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session) {
    res.status(401).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });
    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);

  const tests = await db
    .select()
    .from(testsTable)
    .where(eq(testsTable.ownerId, user.id));

  res.status(200).send({
    success: true,
    data: tests,
  });
  return;
}

// Like or unlike a test
export async function toggleLike(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);
  const testId = Number(req.params.id);

  if (isNaN(testId)) {
    res.status(400).send({
      success: false,
      error: Error.INVALID_CREDENTIALS,
    });
    return;
  }

  if (!token) {
    res.status(307).send({
      success: false,
      error: Error.SESSION_NOT_FOUND,
    });
    return;
  }

  const { user, session } = await lib.validateSession(token);

  if (!session) {
    res.status(401).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });
    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);

  // Verify the test exists
  const existingTest = await db
    .select()
    .from(testsTable)
    .where(eq(testsTable.id, testId))
    .limit(1);

  if (existingTest.length === 0) {
    res.status(404).send({
      success: false,
      error: Error.USER_NOT_FOUND, // Could define a TEST_NOT_FOUND error
    });
    return;
  }

  // Check if the test is private and user is not the owner or admin
  if (
    existingTest[0].isPrivate &&
    existingTest[0].ownerId !== user.id &&
    user.role !== "admin"
  ) {
    res.status(403).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });
    return;
  }

  try {
    // Check if user already liked this test
    const existingLike = await db
      .select()
      .from(likesTable)
      .where(and(eq(likesTable.testId, testId), eq(likesTable.userId, user.id)))
      .limit(1);

    let message;

    if (existingLike.length > 0) {
      // Unlike: Remove the like
      await db
        .delete(likesTable)
        .where(
          and(eq(likesTable.testId, testId), eq(likesTable.userId, user.id)),
        );
      message = "Test unliked";
    } else {
      // Like: Add a new like
      await db.insert(likesTable).values({
        testId,
        userId: user.id,
      });
      message = "Test liked";
    }

    res.status(200).send({
      success: true,
      message,
    });

    logger.info(`${message}: Test ${testId} by user ${user.id}`);
    return;
  } catch (dbError) {
    logger.error(dbError);
    res.status(500).send({
      success: false,
      error: Error.INTERNAL_SERVER_ERROR,
    });
    return;
  }
}

// Get count of likes for a test
export async function getLikes(req: Request, res: Response) {
  const token = lib.getSessionFromCookie(req);
  const testId = Number(req.params.id);

  if (isNaN(testId)) {
    res.status(400).send({
      success: false,
      error: Error.INVALID_CREDENTIALS,
    });
    return;
  }

  if (!token) {
    res.status(307).send({
      success: false,
      error: Error.SESSION_NOT_FOUND,
    });
    return;
  }

  const { session } = await lib.validateSession(token);

  if (!session) {
    res.status(401).send({
      success: false,
      error: Error.UNAUTHORIZED,
    });
    return;
  }

  lib.setSessionCookie(res, token, session.expiresAt);

  // Verify the test exists
  const existingTest = await db
    .select()
    .from(testsTable)
    .where(eq(testsTable.id, testId))
    .limit(1);

  if (existingTest.length === 0) {
    res.status(404).send({
      success: false,
      error: Error.USER_NOT_FOUND, // Could define a TEST_NOT_FOUND error
    });
    return;
  }

  try {
    // Count likes for this test
    const likesCount = await db
      .select({ count: sql`count(*)` })
      .from(likesTable)
      .where(eq(likesTable.testId, testId));

    res.status(200).send({
      success: true,
      data: likesCount[0].count,
    });
    return;
  } catch (dbError) {
    logger.error(dbError);
    res.status(500).send({
      success: false,
      error: Error.INTERNAL_SERVER_ERROR,
    });
    return;
  }
}
