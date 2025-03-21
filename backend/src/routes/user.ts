import { Router } from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  logoutUser,
  getUsersWithSessions,
} from "@/services/user";

const router = Router();

router.get("/users", getUsers);
router.get("/users/sessions", getUsersWithSessions);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.delete("/users/logout/:id", logoutUser);

export default router;
