import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function listUsers(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);
  const pageSize = 25;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { subscription: true, _count: { select: { chats: true } } },
    }),
    prisma.user.count(),
  ]);

  res.json({ users, total, page, pageSize });
}

export async function getOverview(_req: Request, res: Response) {
  const [totalUsers, totalChats, totalMessages, tierCounts] = await Promise.all([
    prisma.user.count(),
    prisma.chat.count(),
    prisma.message.count(),
    prisma.subscription.groupBy({ by: ["tier"], _count: true }),
  ]);

  const messagesByModel = await prisma.message.groupBy({
    by: ["model"],
    _count: true,
    where: { model: { not: null } },
  });

  res.json({
    totalUsers,
    totalChats,
    totalMessages,
    subscriptionsByTier: tierCounts,
    modelUsage: messagesByModel,
    // TODO: revenue requires a payment provider (Stripe etc.) — wire up once payments are added.
    revenue: { mrr: 0, currency: "USD", note: "Payments not yet configured" },
  });
}

export async function listLogs(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);
  const pageSize = 50;

  const [logs, total] = await Promise.all([
    prisma.log.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    }),
    prisma.log.count(),
  ]);

  res.json({ logs, total, page, pageSize });
}

export async function updateUserRole(req: Request, res: Response) {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: req.body.role },
  });
  res.json({ user: { id: user.id, email: user.email, role: user.role } });
}
