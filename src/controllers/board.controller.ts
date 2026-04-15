import type { Request, Response } from "express";
import { getProjectBoard } from "../services/board.service";

export async function boardHandler(req: Request, res: Response) {
  const projectId = Number(req.params.projectId);
  if (isNaN(projectId)) return res.status(400).json({ error: "Invalid project id." });

  try {
    const data = await getProjectBoard(projectId);
    if (!data) return res.status(404).json({ error: "Project not found." });
    res.json(data);
  } catch (err) {
    console.error("GET /board:", err);
    res.status(500).json({ error: "Failed to load board." });
  }
}
