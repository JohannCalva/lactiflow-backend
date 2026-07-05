import { Router } from "express";
import cors from "cors";
import { summaryByDate } from "../controllers/suggestion.controller.js";

const router = Router();

// Open CORS — public endpoints are accessed from any origin (mini app, etc.)
router.use(cors());

// Public endpoint — no authentication required.
// Returns aggregated suggestion totals by product for a given date.
// Used by the standalone mini app dashboard.
router.get("/suggestions/summary", summaryByDate);

export default router;
