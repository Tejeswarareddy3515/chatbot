import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { ApiError } from "../middleware/errorHandler";
import { env } from "../config/env";

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(72),
    name: z.string().min(1).max(100).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const registerValidation = registerSchema;
export const loginValidation = loginSchema;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function publicUser(user: { id: string; email: string; name: string | null; avatarUrl: string | null; role: string }) {
  return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, role: user.role };
}

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      settings: { create: {} },
      subscription: { create: {} },
    },
  });

  const token = signToken({ userId: user.id, role: user.role });
  res.cookie("token", token, COOKIE_OPTIONS);
  res.status(201).json({ token, user: publicUser(user) });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw new ApiError(401, "Invalid email or password");
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.cookie("token", token, COOKIE_OPTIONS);
  res.json({ token, user: publicUser(user) });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token");
  res.json({ success: true });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
  if (!user) throw new ApiError(404, "User not found");
  res.json({ user: publicUser(user) });
}

export function oauthCallback(req: Request, res: Response) {
  const user = req.user as { id: string; role: "USER" | "ADMIN" };
  const token = signToken({ userId: user.id, role: user.role });
  res.cookie("token", token, COOKIE_OPTIONS);
  res.redirect(`${env.clientUrl}/auth/callback?token=${token}`);
}
