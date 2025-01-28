import userRouter from "./users";
import { Router } from "express";

const router = Router();

router.use(userRouter);

export default router;
