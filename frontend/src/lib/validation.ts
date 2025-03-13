import { z } from "zod";

export const userFormSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(5).max(255),
});

export const userUpdateSchema = z.object({
  id: z.number(),
  username: z.string().min(3).max(30),
  password: z.string().min(5).max(255),
  role: z.enum(["admin", "user"]),
});

export const userCreationSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(5).max(255),
  role: z.enum(["admin", "user"]),
});

export type userForm = z.infer<typeof userFormSchema>;
export type userUpdate = z.infer<typeof userUpdateSchema>;
export type userCreate = z.infer<typeof userCreationSchema>;
