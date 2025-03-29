import { Router } from "express";
import auth from "@/routes/auth";
import user from "@/routes/user";
import test from "@/routes/test";
import like from "@/routes/like";
import category from "@/routes/category";

const router = Router();

router.use(auth);
router.use(user);
router.use(test);
router.use(like);
router.use(category);

export default router;
