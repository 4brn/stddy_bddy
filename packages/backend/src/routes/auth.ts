import { db } from "../db";
import { Router, type Request, type Response } from "express";
import type { User, Session } from "../utils/types";
import { userValidationSchema } from "../utils/validation";

const router = Router();

router.post("/api/auth/login", (req: Request, res: Response) => {
    const { username, password } = req.body;

    const result = userValidationSchema.safeParse({ username, password });
    if (result.success === false)
        res.status(400).send({ message: "Invalid data" });
});

router.delete("/api/auth/logout", () => {
    console.log("logout");
});
export default router;
