import {
  usersTable,
  sessionsTable,
  testsTable,
  likesTable,
  categoriesTable,
  resultsTable,
} from "../backend/src/db";

export type User = typeof usersTable.$inferSelect;
export type UserInsert = typeof usersTable.$inferInsert;

export type Session = typeof sessionsTable.$inferSelect;
export type SessionInsert = typeof sessionsTable.$inferInsert;

export type Category = typeof categoriesTable.$inferSelect;
export type CategoryInsert = typeof categoriesTable.$inferInsert;

export type Test = typeof testsTable.$inferSelect;
export type TestInsert = typeof testsTable.$inferInsert;

export type Like = typeof likesTable.$inferSelect;
export type LikeInsert = typeof likesTable.$inferInsert;

export type Result = typeof resultsTable.$inferSelect;
export type ResultInsert = typeof resultsTable.$inferInsert;

export type Question = {
  id: number;
  text: string;
  answers: Answer[];
  correctId: number | null;
};

export type Answer = {
  id: number;
  value: string | number;
};

export type UserContext = Omit<User, "password">;

export type Author = Omit<User, "password" | "role">;

export type UserWithSession = User & { active: boolean };

export type TestSolve = Omit<Test, "author_id" | "category_id"> & {
  category: Category | null;
  author: Author | null;
};

export type TestInfo = Omit<TestSolve, "questions">;

export type SelectedAnswers = Record<number, number>;
export type TestResult = {
  testId: number;
  answers: SelectedAnswers;
};

export type UserCrud = {
  add: () => void;
  update: (newUser: User) => void;
  delete: (user: User) => void;
  logout: (user: UserWithSession) => void;
};

export type TestCrud = {
  add: () => void;
  update: (newTest: Test) => void;
  delete: (test: Test) => void;
};
