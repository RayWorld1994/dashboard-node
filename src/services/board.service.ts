import { prisma } from "../db/client";

const taskInclude = {
  project: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true, avatarUrl: true } },
  _count: { select: { comments: true, history: true } },
} as const;

// Returns the project metadata + all its tasks (grouped by the frontend).
export async function getProjectBoard(projectId: number) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  if (!project) return null;

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: taskInclude,
    orderBy: { createdAt: "asc" },
  });

  return { project, tasks };
}
