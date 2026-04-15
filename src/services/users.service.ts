import { prisma } from "../db/client";

export async function getAllUsers() {
  return prisma.profile.findMany({
    orderBy: { name: "asc" },
  });
}
