import type { Request, Response } from "express";
import { getAllProjects } from "../services/projects.service";

export async function projectsHandler(req: Request, res: Response) {
  try {
    const data = await getAllProjects();
    res.json(data);
  } catch (err) {
    console.error("Projects error:", err);
    res.status(500).json({ error: "Failed to load projects." });
  }
}
