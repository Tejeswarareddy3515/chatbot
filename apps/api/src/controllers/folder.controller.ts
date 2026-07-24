import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ApiError } from "../middleware/errorHandler";

export const folderValidation = z.object({
  body: z.object({ name: z.string().min(1).max(100) }),
});

export async function listFolders(req: Request, res: Response) {
  const folders = await prisma.folder.findMany({
    where: { userId: req.auth!.userId },
    include: { _count: { select: { chats: true } } },
    orderBy: { createdAt: "asc" },
  });
  res.json({ folders });
}

export async function createFolder(req: Request, res: Response) {
  const folder = await prisma.folder.create({
    data: { name: req.body.name, userId: req.auth!.userId },
  });
  res.status(201).json({ folder });
}

export async function renameFolder(req: Request, res: Response) {
  const folder = await prisma.folder.findUnique({ where: { id: req.params.id } });
  if (!folder || folder.userId !== req.auth!.userId) throw new ApiError(404, "Folder not found");
  const updated = await prisma.folder.update({ where: { id: folder.id }, data: { name: req.body.name } });
  res.json({ folder: updated });
}

export async function deleteFolder(req: Request, res: Response) {
  const folder = await prisma.folder.findUnique({ where: { id: req.params.id } });
  if (!folder || folder.userId !== req.auth!.userId) throw new ApiError(404, "Folder not found");
  await prisma.folder.delete({ where: { id: folder.id } });
  res.status(204).send();
}
