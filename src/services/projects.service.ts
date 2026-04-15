import { prisma } from "../db/client";

const projectInclude = {
  owner: { select: { id: true, name: true, avatarUrl: true } },
  _count: { select: { tasks: true } },
} as const;

export async function getAllProjects() {
  return prisma.project.findMany({
    include: projectInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function createProject(data: {
  name: string;
  status: string;
  ownerId: number;
}) {
  return prisma.project.create({
    data,
    include: projectInclude,
  });
}

export async function updateProject(
  id: number,
  data: Partial<{ name: string; status: string; ownerId: number }>
) {
  return prisma.project.update({
    where: { id },
    data,
    include: projectInclude,
  });
}

export async function deleteProject(id: number) {
  // Delete child tasks first, then the project — FK constraints require it.
  await prisma.task.deleteMany({ where: { projectId: id } });
  return prisma.project.delete({ where: { id } });
}
