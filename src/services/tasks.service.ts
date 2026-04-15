import { prisma } from "../db/client";

export async function getAllTasks() {
  return prisma.task.findMany({
    include: {
      // Include the project name and the assignee's name so the frontend
      // has everything it needs in one response.
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
