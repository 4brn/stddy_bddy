import { db } from "@/db";
import "@/db/schema";
import {
  type User,
  type Test,
  type Like,
  usersTable,
  testsTable,
  type Question,
} from "@/db/schema";
import { password as p } from "bun";

async function hash(password: string) {
  return await p.hash(password, "bcrypt");
}

const users: User[] = [
  { id: 1, username: "admin", password: "admin", role: "admin" },
  { id: 2, username: "user1", password: "user1", role: "user" },
  { id: 3, username: "user2", password: "user2", role: "user" },
  { id: 4, username: "user3", password: "user3", role: "user" },
  { id: 5, username: "user4", password: "user4", role: "user" },
];

const test: Test = {
  id: 2,
  ownerId: 2,
  title: "Test2",
  isPrivate: false,
  content: [
    {
      id: 1,
      question: "How many gay are there?",
      options: [
        { id: 1, value: 10 },
        { id: 2, value: 1000 },
        { id: 3, value: 100000 },
        { id: 4, value: "infinity" },
      ],
      correct: "infinity",
    },
    {
      id: 2,
      question: "How many billions must use javascript?",
      options: [
        { id: 1, value: 10 },
        { id: 2, value: 1000 },
        { id: 3, value: 100000 },
        { id: 4, value: "infinity" },
      ],

      correct: 10,
    },
  ],
  createdAt: new Date(Date.now()),
  updatedAt: new Date(Date.now()),
};

// 2025-03-14T14:14:41.019Z

const seedUsers = async () => {
  for (const user of users) {
    user.password = await hash(user.password);
    await db.insert(usersTable).values(user);
  }
};

const seedTests = async () => {
  const tests: Test[] = [];
  const questions: Question[] = [];

  for (let i = 0; i < 10; i++) {
    questions.push({
      id: i + 1,
      question: `Question ${i + 1} ?`,
      options: [
        { id: 1, value: 10 },
        { id: 2, value: 1000 },
        { id: 3, value: 100000 },
        { id: 4, value: "infinity" },
      ],
      correct: 1,
    });
  }

  for (let i = 0; i < 10; i++) {
    tests.push({
      id: i + 1,
      ownerId: i + 1,
      title: `Test ${i + 1}`,
      isPrivate: false,
      content: [...questions],
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
    });
  }

  await db.insert(testsTable).values(tests);
};

// console.log(JSON.stringify(test));
seedTests();
