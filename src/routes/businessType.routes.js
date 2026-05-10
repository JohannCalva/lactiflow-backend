import { Router } from "express";
import * as businessTypeController from "../controllers/businessType.controller.js";

const router = Router();

router.get("/", businessTypeController.getAll);
router.get("/:id", businessTypeController.getById);
router.post("/", businessTypeController.create);
router.put("/:id", businessTypeController.update);
router.delete("/:id", businessTypeController.remove);

export default router;
