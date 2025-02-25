import { users, sessions } from "../backend/src/db";

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;

export type SessionValidationResult =
  | {
      user: User;
      session: Session;
    }
  | {
      user: null;
      session: null;
    };
