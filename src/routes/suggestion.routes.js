import { Router } from "express";
import {
  generate,
  generateForClient,
  getByDate,
  summaryByDate,
} from "../controllers/suggestion.controller.js";

const router = Router();

router.post("/generate", generate);
router.post("/generate/:clientId", generateForClient);
router.get("/", getByDate);
router.get("/summary", summaryByDate);

export default router;
