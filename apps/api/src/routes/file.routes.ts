import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { requireAuth } from "../middleware/auth";
import * as FileController from "../controllers/file.controller";

// NOTE: local disk storage for local dev / scaffold. Swap to S3/GCS in production.
//
// On serverless (Vercel) the bundle directory is read-only and /tmp is the only
// writable path. Uploads there live for the duration of the invocation, which is
// enough for our flow: the parser extracts text and persists it to the database
// during the same request. The file itself is not retained afterwards.
const uploadDir = process.env.VERCEL ? "/tmp/uploads" : path.join(__dirname, "../../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
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
