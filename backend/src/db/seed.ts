import { db, usersTable, testsTable } from "@/db";
import type { UserInsert, TestInsert, Question } from "@shared/types";
import { password as p } from "bun";
import { exit } from "process";

async function hash(password: string) {
    return await p.hash(password, "bcrypt");
}

const seedUsers = async () => {
    const users: UserInsert[] = [];

    for (let i = 1; i <= 10; i++) {
        const user: UserInsert = {
            username: `user${i}`,
            password: `user${i}`,
            role: "user",
        };
        user.password = await hash(user.password);

        users.push(user);
    }

    await db.insert(usersTable).values(users);
    console.info("Users seed: Success");
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
            author_id: i,
            title: `Test ${i}`,
            is_private: false,
            questions: [...questions],
            created_at: new Date(),
            updated_at: new Date(),
        });
    }

    await db.insert(testsTable).values(tests);
    console.info("Tests seed: Success");
};

const users = prompt("Seed users y/n? ");
if (users?.toLowerCase() === "y") {
    try {
        await seedUsers();
    } catch (err) {
        console.error("User Seed Error");
    }
} else {
    console.info("User seed skipped");
    exit();
}
const tests = prompt("Seed tests y/n? ");
if (tests?.toLowerCase() === "y") {
    try {
        await seedTests();
    } catch (err) {
        console.error("Test Seed Error");
    }
} else {
    console.info("Test seed skipped");
    exit();
}
