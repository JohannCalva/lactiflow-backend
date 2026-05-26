import { Router } from "express";
import { generate, generateForClient } from "../controllers/suggestion.controller.js";

const router = Router();

router.post("/generate", generate);
router.post("/generate/:clientId", generateForClient);

export default router;
