import { prisma } from "../db/client";

// Returns the four numbers shown in the summary cards at the top of the dashboard.
export async function getSummary() {
  // prisma.$transaction runs multiple queries at the same time (in parallel),
  // which is faster than awaiting them one after another.
  const [totalProjects, activeTasks, completedTasks, totalUsers] =
    await prisma.$transaction([
      prisma.project.count(),
      prisma.task.count({ where: { status: "in_progress" } }),
      prisma.task.count({ where: { status: "done" } }),
      prisma.profile.count(),
    ]);

  return { totalProjects, activeTasks, completedTasks, totalUsers };
}
