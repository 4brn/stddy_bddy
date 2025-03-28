import { Router } from "express";
import * as like from "@/lib/like";

const router = Router();
// Get count of likes for a test
router.get("/tests/:id/likes", like.getLikes);
router.post("/tests/:id/like", like.Like);
router.post("/tests/:id/dislike", like.Dislike);

export default router;
