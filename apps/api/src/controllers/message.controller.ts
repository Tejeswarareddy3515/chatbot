import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ApiError } from "../middleware/errorHandler";
import { getProviderForModel, ChatMessage } from "../services/ai";

export const sendMessageValidation = z.object({
  body: z.object({
    chatId: z.string().uuid(),
    content: z.string().min(1).max(32000),
  }),
});

async function assertChatOwnership(chatId: string, userId: string) {
  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat || chat.userId !== userId) {
    throw new ApiError(404, "Chat not found");
  }
  return chat;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function startSSE(res: Response) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
}

function sendEvent(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function streamAssistantReply(req: Request, res: Response, chatId: string) {
  const chat = await prisma.chat.findUniqueOrThrow({ where: { id: chatId } });
  const history = await prisma.message.findMany({ where: { chatId }, orderBy: { createdAt: "asc" } });

  const messages: ChatMessage[] = history.map((m) => ({
    role: m.role.toLowerCase() as ChatMessage["role"],
    content: m.content,
  }));

  const provider = getProviderForModel(chat.model);

  startSSE(res);
  sendEvent(res, "start", { model: chat.model, provider: provider.id });

  let fullContent = "";
  let stopped = false;
  req.on("close", () => {
    stopped = true;
  });

  try {
    for await (const chunk of provider.stream({
      model: chat.model,
      messages,
      temperature: chat.temperature,
      topP: chat.topP,
      maxTokens: chat.maxTokens,
      systemPrompt: chat.systemPrompt ?? undefined,
    })) {
      if (stopped) break;
      if (chunk.delta) {
        fullContent += chunk.delta;
        sendEvent(res, "chunk", { delta: chunk.delta });
      }
      if (chunk.done) break;
    }
  } catch (err) {
    sendEvent(res, "error", { message: (err as Error).message });
    return res.end();
  }

  const assistantMessage = await prisma.message.create({
    data: {
      chatId,
      role: "ASSISTANT",
      content: fullContent,
      model: chat.model,
      tokenCount: estimateTokens(fullContent),
    },
  });

  await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });

  sendEvent(res, "done", { message: assistantMessage });
  res.end();
}

export async function sendMessage(req: Request, res: Response) {
  const { chatId, content } = req.body;
  await assertChatOwnership(chatId, req.auth!.userId);

  await prisma.message.create({
    data: { chatId, role: "USER", content, tokenCount: estimateTokens(content) },
  });

  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (chat?.title === "New Chat") {
    await prisma.chat.update({
      where: { id: chatId },
      data: { title: content.slice(0, 60) },
    });
  }

  await streamAssistantReply(req, res, chatId);
}

export async function regenerateMessage(req: Request, res: Response) {
  const chatId = req.params.chatId;
  await assertChatOwnership(chatId, req.auth!.userId);

  const lastAssistant = await prisma.message.findFirst({
    where: { chatId, role: "ASSISTANT" },
    orderBy: { createdAt: "desc" },
  });
  if (lastAssistant) {
    await prisma.message.delete({ where: { id: lastAssistant.id } });
  }

  await streamAssistantReply(req, res, chatId);
}

export async function pinMessage(req: Request, res: Response) {
  const message = await prisma.message.findUnique({ where: { id: req.params.id }, include: { chat: true } });
  if (!message || message.chat.userId !== req.auth!.userId) {
    throw new ApiError(404, "Message not found");
  }
  const updated = await prisma.message.update({
    where: { id: message.id },
    data: { isPinned: !message.isPinned },
  });
  res.json({ message: updated });
}

export async function searchMessages(req: Request, res: Response) {
  const query = String(req.query.q ?? "");
  if (!query) return res.json({ results: [] });

  const results = await prisma.message.findMany({
    where: {
      content: { contains: query, mode: "insensitive" },
      chat: { userId: req.auth!.userId },
    },
    include: { chat: { select: { id: true, title: true } } },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  res.json({ results });
}
