import { Router } from "express";
import * as like from "@/lib/like";

const router = Router();

router.get("/tests/:id/likes", like.getLikes);
router.get("/tests/:id/liked", like.getIsTestLikedByUser);

router.post("/tests/:id/like", like.Like);
router.post("/tests/:id/dislike", like.Dislike);

export default router;
