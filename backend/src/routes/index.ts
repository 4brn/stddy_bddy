import { Router } from "express";
import auth from "@/routes/auth";
import user from "@/routes/user";

const router = Router();

router.use(auth);
router.use(user);

export default router;
