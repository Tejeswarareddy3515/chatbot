/// <reference path="../src/types/express.d.ts" />
// Vercel serverless entrypoint.
//
// Vercel invokes this module's default export as a (req, res) handler. An
// Express app *is* such a handler, so we export the app directly and never call
// app.listen() — that is what src/index.ts does for a long-running server
// (local dev, or any container host).
//
// The app is constructed at module scope so it is reused across warm
// invocations rather than rebuilt on every request.
import { createApp } from "../src/app";

const app = createApp();

export default app;
