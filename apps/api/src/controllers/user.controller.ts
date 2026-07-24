import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export const updateProfileValidation = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    avatarUrl: z.string().url().optional(),
    customInstructions: z.string().max(4000).nullable().optional(),
  }),
});

export const updateSettingsValidation = z.object({
  body: z.object({
    theme: z.enum(["light", "dark", "system"]).optional(),
    defaultModel: z.string().optional(),
    voiceName: z.string().optional(),
    voiceSpeed: z.number().min(0.5).max(2).optional(),
    voicePitch: z.number().min(0.5).max(2).optional(),
    webSearchEnabled: z.boolean().optional(),
  }),
});

export async function updateProfile(req: Request, res: Response) {
  const user = await prisma.user.update({ where: { id: req.auth!.userId }, data: req.body });
  res.json({ user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl } });
}

export async function getSettings(req: Request, res: Response) {
  const settings = await prisma.setting.upsert({
    where: { userId: req.auth!.userId },
    update: {},
    create: { userId: req.auth!.userId },
  });
  res.json({ settings });
}

export async function updateSettings(req: Request, res: Response) {
  const settings = await prisma.setting.upsert({
    where: { userId: req.auth!.userId },
    update: req.body,
    create: { userId: req.auth!.userId, ...req.body },
  });
  res.json({ settings });
}

export async function getSubscription(req: Request, res: Response) {
  const subscription = await prisma.subscription.upsert({
    where: { userId: req.auth!.userId },
    update: {},
    create: { userId: req.auth!.userId },
  });
  res.json({ subscription });
}
