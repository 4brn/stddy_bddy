import type { Request, Response } from "express";
import {
  categoriesTable,
  db,
  resultsTable,
  testsTable,
  usersTable,
} from "@/db";
import {
  getSessionFromCookie,
  setSessionCookie,
  validateSession,
} from "./session";
import { eq, and } from "drizzle-orm";
import type { ResultInsert, TestResult, TestSolve } from "@shared/types";
import { resultValidationSchema } from "@shared/validation";
import { logger } from "@/utils/logger";

export async function postResult(req: Request, res: Response) {
  const token = getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({ error: "Session expired" });
    return;
  }
  const { user, session } = await validateSession(token);

  if (!session || !user) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }
  setSessionCookie(res, token, session.expires_at);

  console.log(req.body);
  const { success, data, error } = await resultValidationSchema.safeParseAsync(
    req.body,
  );

  if (!success) {
    logger.error(error);
    res.status(500).send({ err: "Internal server error" });
    return;
  }

  const test = (
    await db.select().from(testsTable).where(eq(testsTable.id, data.testId))
  )[0];

  const { answers } = data;
  // const questionsIds = Object.keys(answers).map((q) => Number(q));
  let score: number = 0;
  for (const question of test.questions) {
    if (question.correctId === answers[question.id]) {
      score++;
    }
  }

  const result = await db
    .insert(resultsTable)
    .values({
      user_id: user.id,
      test_id: test.id,
      percentage: (score / test.questions.length) * 100,
      solved_at: new Date(),
    })
    .returning()
    .catch((error) => {
      logger.error(error);
      res.status(500).send({ err: "Internal server error" });
      return;
    });

  res.status(200).send(result);
}

export async function getMyTestResults(req: Request, res: Response) {
  const token = getSessionFromCookie(req);

  if (!token) {
    res.status(307).send({ error: "Session expired" });
    return;
  }

  const { user, session } = await validateSession(token);

  if (!session || !user) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }
  setSessionCookie(res, token, session.expires_at);

  const results = await db
    .select({
      test: testsTable.title,
      user: usersTable.username,
      resultsTable,
    })
    .from(resultsTable)
    .leftJoin(usersTable, eq(usersTable.id, resultsTable.user_id))
    .leftJoin(testsTable, eq(testsTable.id, resultsTable.test_id))
    .where(eq(resultsTable.user_id, user.id));

  res.send(results);
}

export async function getMyTestResultsById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).send("Invalid id");
    return;
  }

  const token = getSessionFromCookie(req);
  if (!token) {
    res.status(307).send({ error: "Session expired" });
    return;
  }

  const { user, session } = await validateSession(token);

  if (!session || !user) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }
  setSessionCookie(res, token, session.expires_at);

  const results = await db
    .select()
    .from(resultsTable)
    .where(
      and(eq(resultsTable.user_id, user.id), eq(resultsTable.test_id, id)),
    );

  res.send(results.toReversed());
}
