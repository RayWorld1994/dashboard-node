import { prisma } from "../db/client";

export async function getTaskComments(taskId: number) {
  return prisma.taskComment.findMany({
    where: { taskId },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function addTaskComment(
  taskId: number,
  message: string,
  actorEmail: string
) {
  // Resolve the Profile linked to this auth user's email (may not exist).
  const profile = await prisma.profile.findFirst({ where: { email: actorEmail } });

  return prisma.taskComment.create({
    data: {
      taskId,
      message,
      authorId: profile?.id ?? null,
      authorName: profile?.name ?? actorEmail.split("@")[0],
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
}
