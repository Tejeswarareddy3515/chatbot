import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { prisma } from "../lib/prisma";
import { env } from "./env";

async function findOrCreateOAuthUser(params: {
  provider: "GOOGLE" | "GITHUB";
  providerId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      email: params.email,
      name: params.name,
      avatarUrl: params.avatarUrl,
      provider: params.provider,
      providerId: params.providerId,
      settings: { create: {} },
      subscription: { create: {} },
    },
  });
}

if (env.google.clientId && env.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("Google account has no email"));
          const user = await findOrCreateOAuthUser({
            provider: "GOOGLE",
            providerId: profile.id,
            email,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );
}

if (env.github.clientId && env.github.clientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: env.github.clientId,
        clientSecret: env.github.clientSecret,
        callbackURL: env.github.callbackUrl,
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          const email = profile.emails?.[0]?.value ?? `${profile.username}@users.noreply.github.com`;
          const user = await findOrCreateOAuthUser({
            provider: "GITHUB",
            providerId: profile.id,
            email,
            name: profile.displayName ?? profile.username,
            avatarUrl: profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );
}

export default passport;
