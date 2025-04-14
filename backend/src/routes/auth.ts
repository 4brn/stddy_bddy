import { Router } from "express";
import * as auth from "@/lib/auth";

const router = Router();

router.get("/auth/me", auth.handleMe);

router.post("/auth/register", auth.handleRegister);
router.post("/auth/login", auth.handleLogin);

router.delete("/auth/logout", auth.handleLogout);

export default router;
