import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "./config/passport";
import { env } from "./config/env";
import { generalLimiter } from "./middleware/rateLimit";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/message.routes";
import folderRoutes from "./routes/folder.routes";
import fileRoutes from "./routes/file.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import modelRoutes from "./routes/model.routes";

export function createApp() {
  const app = express();

  // Behind a platform proxy (Vercel and most container hosts), the client IP arrives in
  // X-Forwarded-For. Without this, express-rate-limit sees every request as
  // coming from the proxy and rate-limits all users as one.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  app.use(passport.initialize());
  app.use(generalLimiter);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/chats", chatRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/folders", folderRoutes);
  app.use("/api/files", fileRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/models", modelRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

// Vercel's Express preset resolves this module as the entrypoint (it looks for
// app.* before index.*) and requires the default export to be a server. An
// Express app is itself a (req, res) handler, so exporting the instance
// satisfies that. src/index.ts imports this same instance and calls listen()
// for local dev and container hosts, so only one app is ever constructed.
const app = createApp();

export default app;
