import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ApiError } from "../middleware/errorHandler";

export const createChatValidation = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    model: z.string().optional(),
    folderId: z.string().uuid().optional(),
    systemPrompt: z.string().max(4000).optional(),
  }),
});

export const updateChatValidation = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    folderId: z.string().uuid().nullable().optional(),
    model: z.string().optional(),
    systemPrompt: z.string().max(4000).nullable().optional(),
    temperature: z.number().min(0).max(2).optional(),
    topP: z.number().min(0).max(1).optional(),
    maxTokens: z.number().int().min(1).max(32000).optional(),
    isPinned: z.boolean().optional(),
    isFavorite: z.boolean().optional(),
  }),
});

async function assertOwnership(chatId: string, userId: string) {
  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat || chat.userId !== userId) {
    throw new ApiError(404, "Chat not found");
  }
  return chat;
}

export async function listChats(req: Request, res: Response) {
  const { search, folderId, pinned, favorite } = req.query;

  const chats = await prisma.chat.findMany({
    where: {
      userId: req.auth!.userId,
      ...(search ? { title: { contains: String(search), mode: "insensitive" } } : {}),
      ...(folderId ? { folderId: String(folderId) } : {}),
      ...(pinned === "true" ? { isPinned: true } : {}),
      ...(favorite === "true" ? { isFavorite: true } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  res.json({ chats });
}

export async function createChat(req: Request, res: Response) {
  const chat = await prisma.chat.create({
    data: {
      userId: req.auth!.userId,
      title: req.body.title ?? "New Chat",
      model: req.body.model ?? "gpt-4o-mini",
      folderId: req.body.folderId,
      systemPrompt: req.body.systemPrompt,
    },
  });
  res.status(201).json({ chat });
}

export async function getChat(req: Request, res: Response) {
  const chat = await assertOwnership(req.params.id, req.auth!.userId);
  const messages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: "asc" },
  });
  res.json({ chat, messages });
}

export async function updateChat(req: Request, res: Response) {
  await assertOwnership(req.params.id, req.auth!.userId);
  const chat = await prisma.chat.update({ where: { id: req.params.id }, data: req.body });
  res.json({ chat });
}

export async function deleteChat(req: Request, res: Response) {
  await assertOwnership(req.params.id, req.auth!.userId);
  await prisma.chat.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

export async function shareChat(req: Request, res: Response) {
  const chat = await assertOwnership(req.params.id, req.auth!.userId);
  const shareId = chat.shareId ?? randomUUID();
  const updated = await prisma.chat.update({
    where: { id: chat.id },
    data: { isShared: true, shareId },
  });
  res.json({ shareUrl: `/share/${updated.shareId}` });
}

export async function getSharedChat(req: Request, res: Response) {
  const chat = await prisma.chat.findFirst({ where: { shareId: req.params.shareId, isShared: true } });
  if (!chat) throw new ApiError(404, "Shared chat not found");
  const messages = await prisma.message.findMany({ where: { chatId: chat.id }, orderBy: { createdAt: "asc" } });
  res.json({ chat, messages });
}

export async function exportChat(req: Request, res: Response) {
  const chat = await assertOwnership(req.params.id, req.auth!.userId);
  const messages = await prisma.message.findMany({ where: { chatId: chat.id }, orderBy: { createdAt: "asc" } });
  const format = (req.query.format as string) ?? "markdown";

  if (format === "json") {
    return res.json({ chat, messages });
  }

  const body = messages.map((m) => `**${m.role}**:\n\n${m.content}`).join("\n\n---\n\n");

  if (format === "txt") {
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="${chat.title}.txt"`);
    return res.send(body.replace(/\*\*/g, ""));
  }

  if (format === "pdf") {
    // TODO: render with a PDF library (e.g. pdfkit) — for now, fall back to markdown.
    throw new ApiError(501, "PDF export is not yet implemented; use format=markdown or format=txt");
  }

  res.setHeader("Content-Type", "text/markdown");
  res.setHeader("Content-Disposition", `attachment; filename="${chat.title}.md"`);
  res.send(`# ${chat.title}\n\n${body}`);
}
