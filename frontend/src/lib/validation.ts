import { z } from "zod";

export const User = z.object({
  id: z.number(),
  username: z.string().min(3).max(30),
  password: z.string().min(5).max(255),
  role: z.enum(["admin", "user"]),
});
