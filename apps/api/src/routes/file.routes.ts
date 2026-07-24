import { Router } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { requireAuth } from "../middleware/auth";
import * as FileController from "../controllers/file.controller";

// NOTE: local disk storage for local dev / scaffold. Swap to S3/GCS in production.
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"),
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = Router();

router.use(requireAuth);
router.get("/", FileController.listFiles);
router.post("/upload", upload.single("file"), FileController.uploadFile);
router.delete("/:id", FileController.deleteFile);

export default router;
