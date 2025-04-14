import { Router } from "express";
import * as category from "@/lib/category";

const router = Router();

router.get("/categories", category.getCategories);

export default router;
