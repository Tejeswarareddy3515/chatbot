import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listAvailableModels } from "../services/ai";

const router = Router();

router.get("/", requireAuth, (_req, res) => {
  res.json({ providers: listAvailableModels() });
});

export default router;
