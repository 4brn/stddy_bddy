// stddy_bddy/backend/src/routes/test.ts
import { Router } from "express";
import * as test from "@/lib/test";

const router = Router();

router.get("/tests", test.getTests);
router.get("/my/tests", test.getMyTests);
router.get("/tests/:id", test.getTestById);

router.get("/info/tests", test.getTestsInfo);
router.get("/info/test/:id", test.getTestInfoById);
router.get("/info/my/tests", test.getMyTestsInfo);

router.post("/tests", test.createTest);
router.patch("/tests/:id", test.updateTest);
router.delete("/tests/:id", test.deleteTest);

export default router;
