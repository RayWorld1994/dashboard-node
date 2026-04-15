import type { Request, Response } from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/users.service";

export async function usersHandler(req: Request, res: Response) {
  try {
    res.json(await getAllUsers());
  } catch (err) {
    console.error("GET /users:", err);
    res.status(500).json({ error: "Failed to load users." });
  }
}

export async function createUserHandler(req: Request, res: Response) {
  const { name, email, role, avatarUrl } = req.body as {
    name?: string;
    email?: string;
    role?: string;
    avatarUrl?: string;
  };

  if (!name || !email || !role) {
    return res.status(400).json({ error: "name, email and role are required." });
  }

  try {
    const user = await createUser({ name, email, role, avatarUrl });
    res.status(201).json(user);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "Email already in use." });
    }
    console.error("POST /users:", err);
    res.status(500).json({ error: "Failed to create user." });
  }
}

export async function updateUserHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id." });

  try {
    const user = await updateUser(id, req.body);
    res.json(user);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "Email already in use." });
    }
    console.error("PATCH /users/:id:", err);
    res.status(500).json({ error: "Failed to update user." });
  }
}

export async function deleteUserHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id." });

  try {
    await deleteUser(id);
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /users/:id:", err);
    res.status(500).json({ error: "Failed to delete user." });
  }
}
