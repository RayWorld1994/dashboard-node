import { prisma } from "../db/client";

const taskInclude = {
  project: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true, avatarUrl: true } },
  _count: { select: { comments: true, history: true } },
} as const;

export async function getAllTasks() {
  return prisma.task.findMany({
    include: taskInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getTaskById(id: number) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      ...taskInclude,
      comments: {
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: "asc" },
      },
      history: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

// Resolve a Profile from an email address to attribute history/comments.
async function resolveActor(email?: string) {
  if (!email) return { id: null, name: "System" };
  const p = await prisma.profile.findFirst({ where: { email } });
  return { id: p?.id ?? null, name: p?.name ?? email.split("@")[0] };
}

export async function createTask(
  data: {
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    projectId: number;
    assignedTo: number;
    dueDate?: string | null;
  },
  actorEmail?: string
) {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      status: data.status,
      priority: data.priority,
      projectId: data.projectId,
      assignedTo: data.assignedTo,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
    include: taskInclude,
  });

  const actor = await resolveActor(actorEmail);
  await prisma.taskHistory.create({
    data: {
      taskId: task.id,
      userId: actor.id,
      actorName: actor.name,
      action: "task_created",
      newValue: task.title,
    },
  });

  return task;
}

export async function updateTask(
  id: number,
  data: Partial<{
    title: string;
    description: string | null;
    status: string;
    priority: string;
    projectId: number;
    assignedTo: number;
    dueDate: string | null;
  }>,
  actorEmail?: string
) {
  // Fetch the current state so we can diff and record history.
  const current = await prisma.task.findUnique({ where: { id } });
  if (!current) throw new Error("Task not found.");

  const actor = await resolveActor(actorEmail);

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...data,
      dueDate:
        data.dueDate !== undefined
          ? data.dueDate
            ? new Date(data.dueDate)
            : null
          : undefined,
    },
    include: taskInclude,
  });

  // Record a history entry for each changed field.
  const historyEntries: Array<{
    field: string;
    action: string;
    oldValue: string;
    newValue: string;
  }> = [];

  if (data.status && data.status !== current.status) {
    historyEntries.push({
      field: "status",
      action: "status_changed",
      oldValue: current.status,
      newValue: data.status,
    });
  }
  if (data.priority && data.priority !== current.priority) {
    historyEntries.push({
      field: "priority",
      action: "priority_changed",
      oldValue: current.priority,
      newValue: data.priority,
    });
  }
  if (data.title !== undefined && data.title !== current.title) {
    historyEntries.push({
      field: "title",
      action: "description_updated",
      oldValue: current.title,
      newValue: data.title,
    });
  }
  if (data.description !== undefined && data.description !== current.description) {
    historyEntries.push({
      field: "description",
      action: "description_updated",
      oldValue: current.description ?? "",
      newValue: data.description ?? "",
    });
  }
  if (data.assignedTo !== undefined && data.assignedTo !== current.assignedTo) {
    historyEntries.push({
      field: "assignee",
      action: "assignee_changed",
      oldValue: String(current.assignedTo),
      newValue: String(data.assignedTo),
    });
  }

  if (historyEntries.length > 0) {
    await prisma.taskHistory.createMany({
      data: historyEntries.map((e) => ({
        taskId: id,
        userId: actor.id,
        actorName: actor.name,
        ...e,
      })),
    });
  }

  return updated;
}

export async function deleteTask(id: number) {
  // Delete child rows first.
  await prisma.taskHistory.deleteMany({ where: { taskId: id } });
  await prisma.taskComment.deleteMany({ where: { taskId: id } });
  return prisma.task.delete({ where: { id } });
}

export async function getTaskHistory(id: number) {
  return prisma.taskHistory.findMany({
    where: { taskId: id },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
  });
}
