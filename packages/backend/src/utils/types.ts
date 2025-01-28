import { userTable, sessionTable } from "../db/schema";

declare global {
  namespace Express {
    interface Request {
      session: {
        user?: User;
        id: Session;
      };
    }
  }
}

export type User = typeof userTable.$inferSelect;
export type Session = typeof sessionTable.$inferSelect;

export type SessionValidation =
  | { session: Session; user: User }
  | { session: null; user: null };
