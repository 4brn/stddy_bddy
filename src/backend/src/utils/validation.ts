import { z } from "zod";

export const userSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(5).max(256),
  isAdmin: z.boolean().optional().default(false),
});

export const userUpdateSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  password: z.string().min(5).max(256).optional(),
  isAdmin: z.boolean().optional(),
});
