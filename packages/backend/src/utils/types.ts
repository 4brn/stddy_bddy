import { users, sessions } from "../db";

declare global {
  namespace Express {
    interface Request {
      session: {
        user?: User;
        id: string;
      };
    }
  }
}

export const DAY_IN_MILLIS = 1000 * 60 * 60 * 24;

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
