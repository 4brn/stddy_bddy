import { db, usersTable, testsTable, categoriesTable } from "@/db";
import type { UserInsert, TestInsert, Question } from "@shared/types";
import { password as p } from "bun";
import { exit } from "process";

async function hash(password: string) {
  return await p.hash(password, "bcrypt");
}

async function seedUsers() {
  const users: UserInsert[] = [];
  users.push({
    username: "admin",
    password: await hash("admin"),
    role: "admin",
  });
  users.push({
    username: "deleted_user",
    password: await hash("deleted_user"),
    role: "admin",
  });
  for (let i = 1; i <= 5; i++) {
    const user: UserInsert = {
      username: `user${i}`,
      password: await hash(`user${i}`),
      role: "user",
    };
    users.push(user);
  }

  await db.insert(usersTable).values(users);
  console.info("Users seed: Success");
}

async function seedCategories() {
  const categories = [
    "misc",
    "mathematics",
    "biology",
    "chemistry",
    "physics",
    "literature",
    "history",
    "geography",
    "programming",
  ];
  for (let cat of categories) {
    await db.insert(categoriesTable).values({ category: cat });
  }
  console.info("Categories seed: Success");
}

async function seedTests() {
  const tests: TestInsert[] = [];
  const questions: Question[] = [];

  for (let i = 1; i <= 3; i++) {
    questions.push({
      id: i,
      text: `Question ${i}?`,
      answers: [
        { id: 1, value: 100 },
        { id: 2, value: 1000 },
        { id: 3, value: 100000 },
        { id: 4, value: "infinity" },
      ],
      correctId: 1,
    });
  }

  for (let i = 1; i < 5; i++) {
    tests.push({
      author_id: i,
      title: `Test ${i}`,
      is_private: false,
      category: 1,
      questions: [...questions],
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  await db.insert(testsTable).values(tests);
  console.info("Tests seed: Success");
}

const users = prompt("Seed users y/n? ");
if (users && users.toLowerCase() === "y") {
  try {
    await seedUsers();
  } catch (err) {
    console.error("User seed error");
  }
}

const categories = prompt("Seed categories y/n? ");
if (categories && categories.toLowerCase() === "y") {
  try {
    await seedCategories();
  } catch (err) {
    console.error("Categories seed srror");
    console.error(err);
  }
}

const tests = prompt("Seed tests y/n? ");
if (tests && tests.toLowerCase() === "y") {
  try {
    await seedTests();
  } catch (err) {
    console.error("Test seed error");
  }
}
