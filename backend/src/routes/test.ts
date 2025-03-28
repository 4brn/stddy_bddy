// stddy_bddy/backend/src/routes/test.ts
import { Router } from "express";
import * as test from "@/lib/test";

const router = Router();

// Get all tests (with privacy filtering based on user role)
router.get("/tests", test.getTests);

// Get tests created by current user
router.get("/my/tests", test.getMyTests);

// Get a specific test by ID
router.get("/tests/:id", test.getTestById);

// Create a new test
router.post("/tests", test.createTest);

// Update an existing test
router.patch("/tests/:id", test.updateTest);

// Delete a test
router.delete("/tests/:id", test.deleteTest);


export default router;
