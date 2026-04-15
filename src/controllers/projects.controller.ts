import type { Request, Response } from "express";
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/projects.service";

export async function projectsHandler(req: Request, res: Response) {
  try {
    res.json(await getAllProjects());
  } catch (err) {
    console.error("GET /projects:", err);
    res.status(500).json({ error: "Failed to load projects." });
  }
}

export async function createProjectHandler(req: Request, res: Response) {
  const { name, status, ownerId } = req.body as {
    name?: string;
    status?: string;
    ownerId?: number;
  };

  if (!name || !status || !ownerId) {
    return res.status(400).json({ error: "name, status and ownerId are required." });
  }

  try {
    const project = await createProject({ name, status, ownerId: Number(ownerId) });
    res.status(201).json(project);
  } catch (err) {
    console.error("POST /projects:", err);
    res.status(500).json({ error: "Failed to create project." });
  }
}

export async function updateProjectHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id." });

  try {
    const project = await updateProject(id, req.body);
    res.json(project);
  } catch (err) {
    console.error("PATCH /projects/:id:", err);
    res.status(500).json({ error: "Failed to update project." });
  }
}

export async function deleteProjectHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id." });

  try {
    await deleteProject(id);
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /projects/:id:", err);
    res.status(500).json({ error: "Failed to delete project." });
  }
}
