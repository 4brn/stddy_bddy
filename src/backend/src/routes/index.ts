import { Router } from "express";
import auth from "./auth";
import user from "./user";

const router = Router();
router.use(auth);
router.use(user);

export default router;
