import { db, usersTable, testsTable } from "@/db";
import { logger } from "@/utils/logger";
import type { UserInsert, TestInsert, Question } from "@shared/types";
import { password as p } from "bun";

async function hash(password: string) {
  return await p.hash(password, "bcrypt");
}

const seedUsers = async () => {
  const users: UserInsert[] = [];

  // users.push({
  //   id: 1,
  //   username: "admin",
  //   password: "admin",
  //   role: "admin",
  // });

  for (let i = 2; i <= 10; i++) {
    const user: UserInsert = {
      id: i,
      username: `user${i}`,
      password: `user${i}`,
      role: "user",
    };

    user.password = await hash(user.password);
    await db.insert(usersTable).values(user);
  }
};

const seedTests = async () => {
  const tests: TestInsert[] = [];
  const questions: Question[] = [];

  for (let i = 1; i <= 5; i++) {
    questions.push({
      id: i,
      text: `Question ${i}?`,
      answers: [
        { id: 1, value: 10 },
        { id: 2, value: 1000 },
        { id: 3, value: 100000 },
        { id: 4, value: "infinity" },
      ],
      correctId: 1,
    });
  }

  for (let i = 1; i < +10; i++) {
    tests.push({
      id: i,
      author_id: i,
      title: `Test ${i}`,
      is_private: false,
      questions: [...questions],
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
  logger.info(tests);

  await db.insert(testsTable).values(tests);
  logger.info("Tests seed: Success");
};

// seedUsers();
// seedTests();
