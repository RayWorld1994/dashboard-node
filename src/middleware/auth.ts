import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: jwt.JwtPayload & { userId: number; email: string; role: string };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Server misconfigured (JWT_SECRET)." });
  }

  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "string") {
      return res.status(401).json({ error: "Invalid token." });
    }
    req.user = decoded as jwt.JwtPayload & { userId: number; email: string; role: string };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

// Middleware that runs AFTER authenticateToken.
// Blocks the request if the authenticated user is not an admin.
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}
