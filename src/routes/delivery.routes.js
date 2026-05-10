import { Router } from "express";
import * as deliveryController from "../controllers/delivery.controller.js";

const router = Router();

router.get("/", deliveryController.getAll);
router.get("/:id", deliveryController.getById);
router.post("/", deliveryController.create);
router.put("/:id", deliveryController.update);
router.delete("/:id", deliveryController.remove);

export default router;
