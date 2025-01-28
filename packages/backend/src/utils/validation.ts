import { z } from "zod";

export const userSignupValidationSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(5),
    isAdmin: z.boolean().optional(),
});

export const userValidationSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(5),
});
