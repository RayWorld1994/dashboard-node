import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskHistory,
} from "../services/tasks.service";

export async function tasksHandler(req: AuthenticatedRequest, res: Response) {
  try {
    res.json(await getAllTasks());
  } catch (err) {
    console.error("GET /tasks:", err);
    res.status(500).json({ error: "Failed to load tasks." });
  }
}

export async function taskDetailHandler(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id." });

  try {
    const task = await getTaskById(id);
    if (!task) return res.status(404).json({ error: "Task not found." });
    res.json(task);
  } catch (err) {
    console.error("GET /tasks/:id:", err);
    res.status(500).json({ error: "Failed to load task." });
  }
}

export async function createTaskHandler(req: AuthenticatedRequest, res: Response) {
  const { title, description, status, priority, projectId, assignedTo, dueDate } =
    req.body as {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      projectId?: number;
      assignedTo?: number;
      dueDate?: string | null;
    };

  if (!title || !status || !priority || !projectId || !assignedTo) {
    return res
      .status(400)
      .json({ error: "title, status, priority, projectId and assignedTo are required." });
  }

  try {
    const task = await createTask(
      {
        title,
        description,
        status,
        priority,
        projectId: Number(projectId),
        assignedTo: Number(assignedTo),
        dueDate,
      },
      req.user?.email
    );
    res.status(201).json(task);
  } catch (err) {
    console.error("POST /tasks:", err);
    res.status(500).json({ error: "Failed to create task." });
  }
}

export async function updateTaskHandler(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id." });

  try {
    const task = await updateTask(id, req.body, req.user?.email);
    res.json(task);
  } catch (err) {
    console.error("PATCH /tasks/:id:", err);
    res.status(500).json({ error: "Failed to update task." });
  }
}

export async function deleteTaskHandler(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id." });

  try {
    await deleteTask(id);
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /tasks/:id:", err);
    res.status(500).json({ error: "Failed to delete task." });
  }
}

export async function taskHistoryHandler(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id." });

  try {
    res.json(await getTaskHistory(id));
  } catch (err) {
    console.error("GET /tasks/:id/history:", err);
    res.status(500).json({ error: "Failed to load history." });
  }
}
