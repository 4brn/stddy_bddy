import {
  usersTable,
  sessionsTable,
  testsTable,
  likesTable,
  categoriesTable,
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

export type QuestionWithoutCorrectAnswer = Omit<Question, "correctId">;

export type UserWithSession = User & { active: boolean };

export type TestInfo = Omit<Test, "author_id" | "category_id" | "questions"> & {
  category: Category;
  author: Author;
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
