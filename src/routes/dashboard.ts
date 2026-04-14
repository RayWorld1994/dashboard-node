import express from "express";

import { authenticateToken, type AuthenticatedRequest } from "../middleware/auth";

export const dashboardRouter = express.Router();

dashboardRouter.get("/", authenticateToken, (req: AuthenticatedRequest, res) => {
  return res.status(200).json({
    message: `Welcome to your dashboard, ${req.user?.email ?? "user"}!`,
    userId: req.user?.userId ?? null,
  });
});
