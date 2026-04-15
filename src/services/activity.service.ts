import { prisma } from "../db/client";

// Returns the 30 most recent activity log entries, newest first.
export async function getRecentActivity(limit = 30) {
  return prisma.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
}
