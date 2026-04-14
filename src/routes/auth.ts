import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma";

export const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, password: hashedPassword } });

    return res.status(201).json({ message: "Account created successfully." });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Server misconfigured (JWT_SECRET)." });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, secret, {
      expiresIn: "7d",
    });

    return res.status(200).json({ token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});
