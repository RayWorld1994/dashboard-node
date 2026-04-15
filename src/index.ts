import "dotenv/config";

import cors from "cors";
import express from "express";

import { authRouter } from "./routes/auth";
import { dashboardRouter } from "./routes/dashboard";
import { apiRouter } from "./routes/api";

const app = express();
const requestedPort = process.env.PORT ? Number(process.env.PORT) : 3000;

const allowedOrigins = new Set(
  (process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []).concat([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ])
);

app.use(
  cors({
    origin(origin: string | undefined, callback) {
      if (!origin) return callback(null, true);

      const isLocalhost =
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

      if (allowedOrigins.has(origin) || isLocalhost) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/dashboard", dashboardRouter);
app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

function startServer(port: number): void {
  const server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE" && !process.env.PORT) {
      const nextPort = port + 1;
      console.warn(`Port ${port} in use; trying ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    console.error("Server failed to start:", err);
    process.exit(1);
  });
}

startServer(requestedPort);
