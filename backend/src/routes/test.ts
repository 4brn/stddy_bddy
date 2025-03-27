// stddy_bddy/backend/src/routes/test.ts
import { Router } from "express";
import * as test from "@/lib/test";

const router = Router();

// Get all tests (with privacy filtering based on user role)
router.get("/tests", test.getTests);

// Get tests created by current user
router.get("/tests/my", test.getMyTests);

// Get a specific test by ID
router.get("/tests/:id", test.getTestById);

// Get count of likes for a test
router.get("/tests/:id/likes", test.getLikes);

// Create a new test
router.post("/tests", test.createTest);

// Update an existing test
router.patch("/tests/:id", test.updateTest);

// Delete a test
router.delete("/tests/:id", test.deleteTest);

// Like or unlike a test
router.post("/tests/:id/like", test.Like);
router.post("/tests/:id/dislike", test.Dislike);

export default router;
