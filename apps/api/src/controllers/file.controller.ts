import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../middleware/errorHandler";
import { extractText } from "../services/file-parser.service";

export async function uploadFile(req: Request, res: Response) {
  if (!req.file) throw new ApiError(400, "No file uploaded");

  const extractedText = await extractText(req.file.path, req.file.mimetype);

  const file = await prisma.file.create({
    data: {
      userId: req.auth!.userId,
      chatId: (req.body.chatId as string) || undefined,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      storagePath: req.file.path,
      extractedText,
    },
  });

  res.status(201).json({ file });
}

export async function listFiles(req: Request, res: Response) {
  const files = await prisma.file.findMany({
    where: { userId: req.auth!.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ files });
}

export async function deleteFile(req: Request, res: Response) {
  const file = await prisma.file.findUnique({ where: { id: req.params.id } });
  if (!file || file.userId !== req.auth!.userId) throw new ApiError(404, "File not found");
  await prisma.file.delete({ where: { id: file.id } });
  res.status(204).send();
}
