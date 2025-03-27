import { Router } from "express";
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleMe,
} from "@/lib/auth";

const router = Router();

router.post("/auth/register", handleRegister);
router.post("/auth/login", handleLogin);
router.delete("/auth/logout", handleLogout);
router.get("/auth/me", handleMe);

export default router;
