import app from "./app";
import { env } from "./config/env";

// Bind 0.0.0.0, not the default loopback, so a container host's health check
// can reach the process on its external interface.
const server = app.listen(env.port, "0.0.0.0", () => {
  console.log(`API listening on 0.0.0.0:${env.port} (env: ${env.nodeEnv})`);
  console.log(`Health check: GET /health`);
});

server.on("error", (err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down`);
    server.close(() => process.exit(0));
  });
}
