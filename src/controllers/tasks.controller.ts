import type { Request, Response } from "express";
import { getAllTasks } from "../services/tasks.service";

export async function tasksHandler(req: Request, res: Response) {
  try {
    const data = await getAllTasks();
    res.json(data);
  } catch (err) {
    console.error("Tasks error:", err);
    res.status(500).json({ error: "Failed to load tasks." });
  }
}
