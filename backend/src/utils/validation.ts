import { z } from "zod";

export const User = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(5).max(256),
  role: z.enum(["admin", "user"]),
});

export type User = z.infer<typeof User>;
