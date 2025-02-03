import { z, type ZodSchema } from "zod";

export const userSchema = z.object({
  username: z.string().min(3).max(256),
  password: z.string().min(5).max(256),
});
