import {
  schemaFactory,
  usersTable,
  sessionsTable,
  testsTable,
  likesTable,
} from "../backend/src/db";

const { createInsertSchema, createUpdateSchema, createSelectSchema } =
  schemaFactory({
    coerce: {
      boolean: true,
      date: true,
    },
  });

export const UserValidationSchema = {
  select: createSelectSchema(usersTable),
  insert: createInsertSchema(usersTable),
  update: createUpdateSchema(usersTable),
};

export const SessionValidationSchema = {
  select: createSelectSchema(sessionsTable),
  insert: createInsertSchema(sessionsTable),
  update: createUpdateSchema(sessionsTable),
};

export const TestValidationSchema = {
  select: createSelectSchema(testsTable),
  insert: createInsertSchema(testsTable),
  delete: createUpdateSchema(testsTable),
};

export const LikeValidationSchema = {
  select: createSelectSchema(likesTable),
  insert: createInsertSchema(likesTable),
  update: createUpdateSchema(likesTable),
};
