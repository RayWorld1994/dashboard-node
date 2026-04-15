import type { Request, Response } from "express";
import { getSummary } from "../services/dashboard.service";

export async function summaryHandler(req: Request, res: Response) {
  try {
    const data = await getSummary();
    res.json(data);
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ error: "Failed to load dashboard summary." });
  }
}
