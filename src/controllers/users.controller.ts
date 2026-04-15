import type { Request, Response } from "express";
import { getAllUsers } from "../services/users.service";

export async function usersHandler(req: Request, res: Response) {
  try {
    const data = await getAllUsers();
    res.json(data);
  } catch (err) {
    console.error("Users error:", err);
    res.status(500).json({ error: "Failed to load users." });
  }
}
