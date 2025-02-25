import { Router } from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  logoutUser,
} from "@/lib/user";

const router = Router();

router.get("/users", getUsers);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.delete("/users/logout/:id", logoutUser);

export default router;
