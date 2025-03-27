import {
  usersTable,
  sessionsTable,
  testsTable,
  likesTable,
} from "../backend/src/db";

export type UserSelect = typeof usersTable.$inferSelect;
export type UserInsert = typeof usersTable.$inferInsert;

export type SessionSelect = typeof sessionsTable.$inferSelect;
export type SessionInsert = typeof sessionsTable.$inferInsert;

export type TestSelect = typeof testsTable.$inferSelect;
export type TestInsert = typeof testsTable.$inferInsert;

export type LikeSelect = typeof likesTable.$inferSelect;
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

export type UserWithSession = UserSelect & {
  active: boolean;
};

export type UserCrud = {
  add: () => void;
  update: (newUser: UserSelect) => void;
  delete: (user: UserSelect) => void;
  logout: (user: UserWithSession) => void;
};

export type TestCrud = {
  add: () => void;
  update: (newTest: TestSelect) => void;
  delete: (test: TestSelect) => void;
};
