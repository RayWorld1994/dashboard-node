import { prisma } from "../db/client";

export async function getAllUsers() {
  return prisma.profile.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}) {
  return prisma.profile.create({ data });
}

export async function updateUser(
  id: number,
  data: Partial<{ name: string; email: string; role: string; avatarUrl: string | null }>
) {
  return prisma.profile.update({ where: { id }, data });
}

export async function deleteUser(id: number) {
  // Remove foreign-key references before deleting the profile.
  await prisma.activityLog.deleteMany({ where: { userId: id } });
  await prisma.task.deleteMany({ where: { assignedTo: id } });
  // Unset ownership on projects rather than deleting them.
  // We need a fallback owner — reassign to a random other profile.
  const fallback = await prisma.profile.findFirst({
    where: { id: { not: id } },
  });
  if (fallback) {
    await prisma.project.updateMany({
      where: { ownerId: id },
      data: { ownerId: fallback.id },
    });
  }
  return prisma.profile.delete({ where: { id } });
}
