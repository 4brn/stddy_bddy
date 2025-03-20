import { z } from "zod";
import { testsTable, TestSchema } from "@/db/schema";

export const UserSchema = z.object({
  id: z.number(),
  username: z.string().min(3).max(30),
  password: z.string().min(5).max(255),
  role: z.enum(["admin", "user"]),
});

export type Test = z.infer<typeof TestSchema>;
export type User = z.infer<typeof UserSchema>;
