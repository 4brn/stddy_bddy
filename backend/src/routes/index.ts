import { Router } from "express";
import auth from "@/routes/auth";
import user from "@/routes/user";
import test from "@/routes/test";

const router = Router();

router.use(auth);
router.use(user);
router.use(test);

export default router;
