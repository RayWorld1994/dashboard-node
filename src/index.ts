import express, { Request, Response } from "express";

const app = express();
const requestedPort = process.env.PORT ? Number(process.env.PORT) : 3000;

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    message: "Hello from dashboard-node",
    method: req.method,
    url: req.originalUrl,
  });
});

function startServer(port: number): void {
  const server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (
      err.code === "EADDRINUSE" &&
      !process.env.PORT &&
      port === requestedPort
    ) {
      const nextPort = port + 1;
      console.warn(`Port ${port} in use; trying ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    console.error("Server failed to start:", err);
    process.exitCode = 1;
  });
}

startServer(requestedPort);
