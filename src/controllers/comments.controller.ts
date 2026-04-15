import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { getTaskComments, addTaskComment } from "../services/comments.service";

export async function taskCommentsHandler(req: AuthenticatedRequest, res: Response) {
  const taskId = Number(req.params.id);
  if (isNaN(taskId)) return res.status(400).json({ error: "Invalid task id." });

  try {
    res.json(await getTaskComments(taskId));
  } catch (err) {
    console.error("GET /tasks/:id/comments:", err);
    res.status(500).json({ error: "Failed to load comments." });
  }
}

export async function addCommentHandler(req: AuthenticatedRequest, res: Response) {
  const taskId = Number(req.params.id);
  if (isNaN(taskId)) return res.status(400).json({ error: "Invalid task id." });

  const { message } = req.body as { message?: string };
  if (!message?.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const comment = await addTaskComment(taskId, message.trim(), req.user!.email);
    res.status(201).json(comment);
  } catch (err) {
    console.error("POST /tasks/:id/comments:", err);
    res.status(500).json({ error: "Failed to add comment." });
  }
}
