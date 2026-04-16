import type { Response } from "express";
import type { ModelMessage } from "ai";
import type { AuthenticatedRequest } from "../middleware/auth";
import { resolveUserContext } from "../chat/context";
import { createChatStream } from "../chat/service";
import { auditError } from "../chat/audit";

// Simple in-memory rate limiter: max 30 requests per user per minute.
const requestCounts = new Map<number, { count: number; resetAt: number }>();

function checkRateLimit(userId: number): boolean {
  const now = Date.now();
  const entry = requestCounts.get(userId);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 30) return false;
  entry.count++;
  return true;
}

export async function chatQueryHandler(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!process.env.OPENAI_API_KEY) {
    return res
      .status(503)
      .json({ error: "Chatbot is not configured (OPENAI_API_KEY missing)." });
  }

  if (!checkRateLimit(req.user!.userId)) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment." });
  }

  const { messages } = req.body as { messages?: ModelMessage[] };

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required." });
  }

  // Cap conversation history to 20 messages to limit token usage
  // and reduce prompt-injection surface via crafted history.
  const safeMessages = messages.slice(-20) as ModelMessage[];

  let ctx;
  try {
    ctx = await resolveUserContext(req);
  } catch (err) {
    console.error("chat: context resolve failed", err);
    return res.status(500).json({ error: "Failed to resolve user context." });
  }

  try {
    createChatStream(ctx, safeMessages, res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    auditError(ctx, msg);
    console.error("chat: stream error", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Chat service error." });
    }
  }
}
