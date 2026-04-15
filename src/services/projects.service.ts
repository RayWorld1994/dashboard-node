import { prisma } from "../db/client";

// Fetches all projects, including the owner's name so the frontend
// can display "owned by Alice" without making a second request.
export async function getAllProjects() {
  return prisma.project.findMany({
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true } },
      // _count gives us the number of related records without loading them all.
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
