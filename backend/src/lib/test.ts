// stddy_bddy/backend/src/services/test.ts
import { type Request, type Response } from "express";
import { db, testsTable, likesTable, usersTable } from "@/db";
import { and, eq, sql } from "drizzle-orm";
import { TestValidationSchema } from "@shared/validation";
import { logger } from "@/utils/logger";
import {
  getSessionFromCookie,
  setSessionCookie,
  validateSession,
} from "@/lib/session";
import type { Question, TestInsert, TestSelect } from "@shared/types";

// Get all tests (with privacy filter based on user role)
export async function getTests(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  if (!token) {
    res.status(307).send({ error: "No active session found" });
    return;
  }

  const { user, session } = await validateSession(token);
  if (!session) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }
  setSessionCookie(res, token, session.expires_at);

  let tests = await db.select().from(testsTable);

  // Filter private tests for non-admin users
  if (user.role === "user") {
    tests = tests.filter(
      (test) => !test.is_private || test.author_id === user.id,
    );
  }

  res.status(200).send({ data: tests });
  return;
}

// Get a specific test by ID
export async function getTestById(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  const testId = Number(req.params.id);
  if (isNaN(testId)) {
    res.status(400).send({ error: "Invalid id" });
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

  const test = await db
    .select()
    .from(testsTable)
    .where(eq(testsTable.id, testId))
    .limit(1);

  if (test.length === 0) {
    res.status(404).send({ error: "Test not found" });
    return;
  }

  // Check if user can access this test
  if (
    test[0].is_private &&
    user.role !== "admin" &&
    test[0].author_id !== user.id
  ) {
    res.status(403).send({ error: "Unauthorized" });
    return;
  }

  res.status(200).send({ data: test[0] });
  return;
}

// Create a new test
export async function createTest(req: Request, res: Response) {
  const token = getSessionFromCookie(req);

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

  const { success, data, error } = await TestValidationSchema.insert
    .omit({ author_id: true, created_at: true, updated_at: true, id: true })
    .safeParseAsync(req.body);
  if (!success) {
    logger.error(error);
    res.status(400).send({ error: "Invalid test credentials" });
    return;
  }

  // Set owner and timestamps
  const testData = {
    ...data,
    author_id: user.id,
    created_at: new Date(),
    updated_at: new Date(),
  };

  try {
    const result = await db
      .insert(testsTable)
      .values({
        title: testData.title,
        is_private: testData.is_private,
        questions: testData.questions as Question[],
        category: testData.category,
        author_id: testData.author_id,
        created_at: testData.created_at,
        updated_at: testData.updated_at,
      } as TestInsert)
      .returning();

    res.status(201).send({ data: result[0] });

    logger.info(`Test created: ${result[0].id} by user ${user.id}`);
    return;
  } catch (dbError) {
    logger.error(dbError);
    res.status(500).send({ error: "Internal server error" });
    return;
  }
}

// Get tests created by the current user
export async function getMyTests(req: Request, res: Response) {
  const token = getSessionFromCookie(req);

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

  const tests = await db
    .select()
    .from(testsTable)
    .where(eq(testsTable.author_id, user.id));

  res.status(200).send({ data: tests });
  return;
}

// Update an existing test
export async function updateTest(req: Request, res: Response) {
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

  // Check if user is authorized to update the test
  if (existingTest[0].author_id !== user.id && user.role !== "admin") {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }

  const { success, data, error } =
    await TestValidationSchema.select.safeParseAsync({
      ...existingTest[0],
      ...req.body,
    });

  if (!success) {
    logger.error(error);
    res.status(400).send({ error: "Invalid test data" });
    return;
  }

  // Prepare update data, preserving ownerId and createdAt
  const updateData: TestSelect = {
    id: data.id,
    title: data.title,
    is_private: data.is_private,
    category_id: data.category_id,
    questions: data.questions as Question[],
    author_id: data.author_id,
    created_at: data.created_at,
    updated_at: new Date(),
  };

  try {
    await db
      .update(testsTable)
      .set(updateData)
      .where(eq(testsTable.id, testId));

    res.status(200).send({ data: updateData });
    logger.info(`Test updated: ${testId} by user ${user.id}`);
    return;
  } catch (dbError) {
    logger.error(dbError);
    res.status(500).send({ error: "Internal server error" });
    return;
  }
}

// Delete a test
export async function deleteTest(req: Request, res: Response) {
  const token = getSessionFromCookie(req);
  const testId = Number(req.params.id);

  if (isNaN(testId)) {
    res.status(400).send({ error: "Invalid test data" });
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

  // Check if user is authorized to delete the test
  if (existingTest[0].author_id !== user.id && user.role !== "admin") {
    res.status(403).send({ error: "Forbidden" });
    return;
  }

  try {
    // First delete any likes associated with this test
    await db.delete(likesTable).where(eq(likesTable.test_id, testId));

    // Then delete the test
    await db.delete(testsTable).where(eq(testsTable.id, testId));

    res.status(200).send({ message: "Test deleted" });
    logger.info(`Test deleted: ${testId} by user ${user.id}`);
    return;
  } catch (dbError) {
    logger.error(dbError);
    res.status(500).send({ error: "Internal server error" });
    return;
  }
}
