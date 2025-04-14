import { Router } from "express";
import * as user from "@/lib/user";

const router = Router();

router.get("/users", user.getUsers);
router.get("/users/:id", user.getUser);
router.get("/users/with/sessions", user.getUsersWithSessions);
router.post("/users", user.createUser);
router.patch("/users/:id", user.updateUser);
router.delete("/users/:id", user.deleteUser);
router.delete("/users/:id/logout", user.logoutUser);

export default router;
