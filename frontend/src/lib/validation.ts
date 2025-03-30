import { z } from "zod";

export const User = z.object({
  id: z.number(),
  username: z.string().min(3).max(30),
  password: z.string().min(5).max(255),
  role: z.enum(["admin", "user"]),
});

const AnswerSchema = z.object({
  id: z.number(),
  value: z.union([z.string().min(1), z.number()]),
});

// Question Schema
const QuestionSchema = z.object({
  id: z.number(),
  text: z.string().min(1),
  answers: z.array(AnswerSchema).min(1),
  correctId: z.number(),
});

export const TestSchema = z.object({
  id: z.number().optional(), // optional because it's auto-incremented
  author_id: z.number(),
  title: z.string().min(1),
  is_private: z.boolean(),
  category_id: z.number().default(1),
  questions: z.array(QuestionSchema),
});

// For creating new test (without id)
export const CreateTestSchema = TestSchema.omit({ id: true });

// For updating test (all fields optional)
export const UpdateTestSchema = TestSchema.partial();

// Type definitions
export type Test = z.infer<typeof TestSchema>;
export type CreateTest = z.infer<typeof CreateTestSchema>;
export type UpdateTest = z.infer<typeof UpdateTestSchema>;
