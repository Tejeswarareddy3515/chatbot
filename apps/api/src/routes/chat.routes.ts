import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import * as ChatController from "../controllers/chat.controller";

const router = Router();

router.get("/shared/:shareId", ChatController.getSharedChat);

router.use(requireAuth);
router.get("/", ChatController.listChats);
router.post("/", validate(ChatController.createChatValidation), ChatController.createChat);
router.get("/:id", ChatController.getChat);
router.patch("/:id", validate(ChatController.updateChatValidation), ChatController.updateChat);
router.delete("/:id", ChatController.deleteChat);
router.post("/:id/share", ChatController.shareChat);
router.get("/:id/export", ChatController.exportChat);

export default router;
