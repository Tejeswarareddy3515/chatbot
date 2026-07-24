import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { chatLimiter } from "../middleware/rateLimit";
import * as MessageController from "../controllers/message.controller";

const router = Router();

router.use(requireAuth);
router.get("/search", MessageController.searchMessages);
router.post("/", chatLimiter, validate(MessageController.sendMessageValidation), MessageController.sendMessage);
router.post("/:chatId/regenerate", chatLimiter, MessageController.regenerateMessage);
router.patch("/:id/pin", MessageController.pinMessage);

export default router;
