import { Router } from "express";
import * as result from "@/lib/result";

const router = Router();

router.get("/my/results", result.getMyTestResults);
router.get("/my/results/:id", result.getMyTestResultsById);

router.post("/results", result.postResult);

export default router;
