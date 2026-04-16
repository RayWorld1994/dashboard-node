/**
 * Read-only database access layer for the chatbot.
 *
 * Security contract:
 *   - Every function in this file is a SELECT-only operation.
 *   - No function here mutates any row.
 *   - The caller is responsible for passing only IDs that the authenticated
 *     user is already authorized to see (enforced in chat/tools.ts).
 *
 * For production, point CHATBOT_DATABASE_URL at a Postgres role that has
 * SELECT grants only (see scripts/create-readonly-role.sql).
 */

import { prisma } from "./client";

// ── Shared includes ────────────────────────────────────────────────────────

const taskPublicInclude = {
  project: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true, avatarUrl: true } },
  _count: { select: { comments: true } },
} as const;

// ── Projects ───────────────────────────────────────────────────────────────

export async function dbGetAllProjects() {
  return prisma.project.findMany({
    include: {
      owner: { select: { id: true, name: true } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function dbGetProjectsByProfileId(profileId: number) {
  // Projects where the profile owns OR has at least one assigned task.
  const owned = await prisma.project.findMany({
    where: { ownerId: profileId },
    include: {
      owner: { select: { id: true, name: true } },
      _count: { select: { tasks: true } },
    },
    take: 50,
  });

  const withTask = await prisma.project.findMany({
    where: {
      tasks: { some: { assignedTo: profileId } },
      id: { notIn: owned.map((p) => p.id) },
    },
    include: {
      owner: { select: { id: true, name: true } },
      _count: { select: { tasks: true } },
    },
    take: 50,
  });

  return [...owned, ...withTask];
}

export async function dbGetProjectById(id: number) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      _count: { select: { tasks: true } },
    },
  });
}

// ── Tasks ──────────────────────────────────────────────────────────────────

export async function dbGetAllTasks(filters?: {
  status?: string;
  priority?: string;
  projectId?: number;
}) {
  return prisma.task.findMany({
    where: {
      status: filters?.status ?? undefined,
      priority: filters?.priority ?? undefined,
      projectId: filters?.projectId ?? undefined,
    },
    include: taskPublicInclude,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function dbGetTasksByProfileId(
  profileId: number,
  filters?: { status?: string; priority?: string }
) {
  return prisma.task.findMany({
    where: {
      assignedTo: profileId,
      status: filters?.status ?? undefined,
      priority: filters?.priority ?? undefined,
    },
    include: taskPublicInclude,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function dbGetTasksByProjectId(
  projectId: number,
  profileId?: number // pass to scope to one user
) {
  return prisma.task.findMany({
    where: {
      projectId,
      assignedTo: profileId ?? undefined,
    },
    include: taskPublicInclude,
    orderBy: { status: "asc" },
    take: 50,
  });
}

export async function dbGetTaskById(id: number) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      ...taskPublicInclude,
      comments: {
        select: { id: true, authorName: true, message: true, createdAt: true },
        orderBy: { createdAt: "asc" },
        take: 20,
      },
      history: {
        select: { action: true, field: true, oldValue: true, newValue: true, actorName: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 15,
      },
    },
  });
}

export async function dbSearchTasks(query: string, profileId?: number) {
  return prisma.task.findMany({
    where: {
      title: { contains: query, mode: "insensitive" },
      assignedTo: profileId ?? undefined,
    },
    include: taskPublicInclude,
    take: 20,
  });
}

// ── Users / Profiles ───────────────────────────────────────────────────────

export async function dbGetAllProfiles() {
  return prisma.profile.findMany({
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
    orderBy: { name: "asc" },
    take: 100,
  });
}

// Limited view — name + role only, no email, no avatarUrl for non-admins.
export async function dbGetProfilesLimited() {
  return prisma.profile.findMany({
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
    take: 100,
  });
}

export async function dbGetProfileByEmail(email: string) {
  return prisma.profile.findFirst({
    where: { email },
    select: { id: true, name: true, role: true, avatarUrl: true },
  });
}

// ── Summary / Stats ────────────────────────────────────────────────────────

export async function dbGetFullSummary() {
  const [totalProjects, activeTasks, completedTasks, totalUsers] =
    await Promise.all([
      prisma.project.count(),
      prisma.task.count({ where: { status: { not: "done" } } }),
      prisma.task.count({ where: { status: "done" } }),
      prisma.profile.count(),
    ]);
  return { totalProjects, activeTasks, completedTasks, totalUsers };
}

export async function dbGetSummaryForProfile(profileId: number) {
  const projects = await dbGetProjectsByProfileId(profileId);
  const projectIds = projects.map((p) => p.id);

  const [myTasks, completedTasks, totalProjects] = await Promise.all([
    prisma.task.count({ where: { assignedTo: profileId, status: { not: "done" } } }),
    prisma.task.count({ where: { assignedTo: profileId, status: "done" } }),
    prisma.project.count({ where: { id: { in: projectIds } } }),
  ]);

  return {
    totalProjects,
    activeTasks: myTasks,
    completedTasks,
    totalUsers: null, // not visible to regular users
  };
}

// ── Recent activity ────────────────────────────────────────────────────────

export async function dbGetRecentActivity(limit = 10, profileId?: number) {
  return prisma.activityLog.findMany({
    where: profileId ? { userId: profileId } : undefined,
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
