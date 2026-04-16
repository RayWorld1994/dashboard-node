/**
 * Structured audit logger for the chatbot.
 *
 * Every question, every tool call, and every denial is logged with the
 * authenticated user's identity so the full access trail is visible.
 *
 * Production upgrade: replace console.log with your logging service
 * (Winston → file/CloudWatch, Datadog, Logtail, etc.).
 *
 * What is NEVER logged:
 *   - JWT tokens or raw credentials
 *   - Full SQL queries or raw DB results
 *   - Passwords or sensitive personal data beyond what the plan requires
 */

import type { UserContext } from "./context";

export interface AuditEvent {
  type: "question" | "tool_call" | "tool_denied" | "error" | "rate_limited";
  userId: number;
  email: string;
  role: string;
  timestamp: string;
  question?: string;
  tool?: string;
  filters?: Record<string, unknown>;
  accessGranted?: boolean;
  denyReason?: string;
  errorMessage?: string;
}

export function auditLog(event: AuditEvent) {
  // Structured JSON so log aggregators can index each field.
  console.log(JSON.stringify({ source: "chatbot-audit", ...event }));
}

export function auditQuestion(ctx: UserContext, question: string) {
  auditLog({
    type: "question",
    userId: ctx.authUserId,
    email: ctx.email,
    role: ctx.role,
    timestamp: new Date().toISOString(),
    question: question.slice(0, 500), // truncate to avoid logging huge inputs
  });
}

export function auditToolCall(
  ctx: UserContext,
  toolName: string,
  args: Record<string, unknown>
) {
  auditLog({
    type: "tool_call",
    userId: ctx.authUserId,
    email: ctx.email,
    role: ctx.role,
    timestamp: new Date().toISOString(),
    tool: toolName,
    filters: args,
    accessGranted: true,
  });
}

export function auditError(ctx: UserContext, message: string) {
  auditLog({
    type: "error",
    userId: ctx.authUserId,
    email: ctx.email,
    role: ctx.role,
    timestamp: new Date().toISOString(),
    errorMessage: message,
  });
}
