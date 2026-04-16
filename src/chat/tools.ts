/**
 * Authorization-aware tool definitions for the chatbot.
 *
 * Security model:
 *   Every tool receives the authenticated UserContext in its closure.
 *   Authorization is enforced in code — never by prompt instruction alone.
 *
 *   admin  → full access to all data
 *   user   → scoped to their own profile: tasks they are assigned to,
 *             projects those tasks belong to, limited user list (no emails)
 */

import { tool } from "ai";
import { z } from "zod";
import type { UserContext } from "./context";
import {
  dbGetFullSummary,
  dbGetSummaryForProfile,
  dbGetAllProjects,
  dbGetProjectsByProfileId,
  dbGetProjectById,
  dbGetAllTasks,
  dbGetTasksByProfileId,
  dbGetTasksByProjectId,
  dbGetTaskById,
  dbSearchTasks,
  dbGetAllProfiles,
  dbGetProfilesLimited,
  dbGetRecentActivity,
} from "../db/readonly";

// ── Helpers ────────────────────────────────────────────────────────────────

function deny(reason: string) {
  return { error: reason, authorized: false };
}

function notLinked() {
  return deny(
    "Your login account is not linked to a team profile yet. Ask an admin to add you as a team member."
  );
}

// ── Tool factory ───────────────────────────────────────────────────────────

export function buildTools(ctx: UserContext) {
  return {
    get_dashboard_summary: tool({
      description:
        "Get a dashboard summary with counts for projects, tasks, and team members. " +
        "Admins see app-wide totals. Regular users see only their own scope.",
      inputSchema: z.object({}),
      execute: async () => {
        if (ctx.isAdmin) return await dbGetFullSummary();
        if (!ctx.profileId) return notLinked();
        return await dbGetSummaryForProfile(ctx.profileId);
      },
    }),

    get_my_projects: tool({
      description:
        "List projects visible to the current user. Admins see all projects. " +
        "Regular users see only projects they own or have tasks in.",
      inputSchema: z.object({
        status: z
          .enum(["active", "completed", "pending"])
          .optional()
          .describe("Filter by project status"),
      }),
      execute: async ({ status }) => {
        const projects = ctx.isAdmin
          ? await dbGetAllProjects()
          : ctx.profileId
          ? await dbGetProjectsByProfileId(ctx.profileId)
          : [];

        const filtered = status ? projects.filter((p) => p.status === status) : projects;

        return filtered.map((p) => ({
          id: p.id,
          name: p.name,
          status: p.status,
          owner: p.owner.name,
          taskCount: p._count.tasks,
          createdAt: p.createdAt,
        }));
      },
    }),

    get_my_tasks: tool({
      description:
        "Get tasks assigned to the current user. Supports filtering by status and priority. " +
        "Admins can see all tasks.",
      inputSchema: z.object({
        status: z
          .enum(["todo", "in_progress", "review", "blocked", "done"])
          .optional()
          .describe("Filter by task status"),
        priority: z
          .enum(["low", "medium", "high", "urgent"])
          .optional()
          .describe("Filter by priority"),
      }),
      execute: async ({ status, priority }) => {
        const tasks = ctx.isAdmin
          ? await dbGetAllTasks({ status, priority })
          : ctx.profileId
          ? await dbGetTasksByProfileId(ctx.profileId, { status, priority })
          : [];

        return tasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          project: t.project.name,
          assignee: t.assignee.name,
          dueDate: t.dueDate,
          commentCount: t._count.comments,
        }));
      },
    }),

    get_project_tasks: tool({
      description:
        "Get tasks for a specific project. Admins see all tasks. " +
        "Regular users see only tasks assigned to them in that project.",
      inputSchema: z.object({
        projectId: z.number().int().positive().describe("The project ID"),
        status: z
          .enum(["todo", "in_progress", "review", "blocked", "done"])
          .optional(),
      }),
      execute: async ({ projectId, status }) => {
        if (!ctx.isAdmin) {
          if (!ctx.profileId) return notLinked();
          const project = await dbGetProjectById(projectId);
          if (!project) return deny("Project not found.");
          const tasks = await dbGetTasksByProjectId(projectId, ctx.profileId);
          if (tasks.length === 0) {
            return deny(
              `You do not have access to project "${project.name}" or have no tasks there.`
            );
          }
          const filtered = status ? tasks.filter((t) => t.status === status) : tasks;
          return {
            project: project.name,
            note: "Showing only tasks assigned to you in this project.",
            tasks: filtered.map((t) => ({
              id: t.id,
              title: t.title,
              status: t.status,
              priority: t.priority,
              dueDate: t.dueDate,
            })),
          };
        }

        const [project, tasks] = await Promise.all([
          dbGetProjectById(projectId),
          dbGetTasksByProjectId(projectId),
        ]);
        if (!project) return deny("Project not found.");
        const filtered = status ? tasks.filter((t) => t.status === status) : tasks;
        return {
          project: project.name,
          taskCount: project._count.tasks,
          tasks: filtered.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            assignee: t.assignee.name,
            dueDate: t.dueDate,
          })),
        };
      },
    }),

    get_task_details: tool({
      description:
        "Get full details for a specific task, including description, comments, and change history.",
      inputSchema: z.object({
        taskId: z.number().int().positive().describe("The task ID"),
      }),
      execute: async ({ taskId }) => {
        const task = await dbGetTaskById(taskId);
        if (!task) return deny("Task not found.");

        if (!ctx.isAdmin) {
          if (!ctx.profileId) return notLinked();
          if (task.assignedTo !== ctx.profileId) {
            return deny("You are not authorized to view details of this task.");
          }
        }

        return {
          id: task.id,
          title: task.title,
          description: task.description ?? "(no description)",
          status: task.status,
          priority: task.priority,
          project: task.project.name,
          assignee: task.assignee.name,
          dueDate: task.dueDate,
          createdAt: task.createdAt,
          comments: task.comments.map((c) => ({
            author: c.authorName,
            message: c.message,
            at: c.createdAt,
          })),
          recentChanges: task.history.slice(0, 5).map((h) => ({
            action: h.action,
            by: h.actorName,
            from: h.oldValue,
            to: h.newValue,
            at: h.createdAt,
          })),
        };
      },
    }),

    search_tasks: tool({
      description:
        "Search tasks by keyword in the title. Results are scoped to what the current user is allowed to see.",
      inputSchema: z.object({
        query: z.string().min(2).describe("Keyword to search in task titles"),
      }),
      execute: async ({ query }) => {
        const tasks = ctx.isAdmin
          ? await dbSearchTasks(query)
          : ctx.profileId
          ? await dbSearchTasks(query, ctx.profileId)
          : [];

        if (tasks.length === 0) return { results: [], note: "No matching tasks found." };

        return {
          results: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            project: t.project.name,
            assignee: t.assignee.name,
          })),
        };
      },
    }),

    get_visible_users: tool({
      description:
        "List team members. Admins see full info including emails. " +
        "Regular users see names and roles only (no emails).",
      inputSchema: z.object({}),
      execute: async () => {
        if (ctx.isAdmin) {
          const profiles = await dbGetAllProfiles();
          return profiles.map((p) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            role: p.role,
          }));
        }
        // Field-level filtering: strip email for non-admins
        const profiles = await dbGetProfilesLimited();
        return {
          note: "Email addresses are not visible with your current permissions.",
          members: profiles.map((p) => ({ name: p.name, role: p.role })),
        };
      },
    }),

    get_project_summary: tool({
      description:
        "Get a summary for a specific project including status and task breakdown.",
      inputSchema: z.object({
        projectId: z.number().int().positive().describe("The project ID"),
      }),
      execute: async ({ projectId }) => {
        const project = await dbGetProjectById(projectId);
        if (!project) return deny("Project not found.");

        if (!ctx.isAdmin) {
          if (!ctx.profileId) return notLinked();
          const myTasks = await dbGetTasksByProjectId(projectId, ctx.profileId);
          if (myTasks.length === 0) {
            return deny(`You do not have access to project "${project.name}".`);
          }
        }

        const tasks = await dbGetTasksByProjectId(projectId);
        const byStatus = tasks.reduce<Record<string, number>>((acc, t) => {
          acc[t.status] = (acc[t.status] ?? 0) + 1;
          return acc;
        }, {});

        return {
          name: project.name,
          status: project.status,
          owner: project.owner.name,
          totalTasks: project._count.tasks,
          tasksByStatus: byStatus,
          createdAt: project.createdAt,
        };
      },
    }),

    get_recent_activity: tool({
      description:
        "Get recent activity in the dashboard. Admins see all activity; regular users see only their own.",
      inputSchema: z.object({
        limit: z
          .number()
          .int()
          .min(1)
          .max(20)
          .default(10)
          .describe("Number of recent entries to return (max 20)"),
      }),
      execute: async ({ limit }) => {
        const profileId = ctx.isAdmin ? undefined : (ctx.profileId ?? -1);
        const activity = await dbGetRecentActivity(limit, profileId);
        if (activity.length === 0) return { items: [], note: "No recent activity." };
        return {
          items: activity.map((a) => ({
            who: a.user.name,
            action: a.action,
            on: a.entityType,
            at: a.createdAt,
          })),
        };
      },
    }),
  };
}
