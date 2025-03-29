import { Router } from "express";
import * as category from "@/lib/category";

const router = Router();
// Get count of likes for a test
router.get("/categories", category.getCategories);

export default router;
