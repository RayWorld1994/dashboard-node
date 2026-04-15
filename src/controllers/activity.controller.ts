import type { Request, Response } from "express";
import { getRecentActivity } from "../services/activity.service";

export async function activityHandler(req: Request, res: Response) {
  try {
    const data = await getRecentActivity();
    res.json(data);
  } catch (err) {
    console.error("Activity error:", err);
    res.status(500).json({ error: "Failed to load activity." });
  }
}
