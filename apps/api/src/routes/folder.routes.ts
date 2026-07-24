import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import * as FolderController from "../controllers/folder.controller";

const router = Router();

router.use(requireAuth);
router.get("/", FolderController.listFolders);
router.post("/", validate(FolderController.folderValidation), FolderController.createFolder);
router.patch("/:id", validate(FolderController.folderValidation), FolderController.renameFolder);
router.delete("/:id", FolderController.deleteFolder);

export default router;
