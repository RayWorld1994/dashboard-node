import "dotenv/config";
import { faker } from "@faker-js/faker";
import { prisma } from "../db/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Pick a random item from an array
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Return a random date between `daysAgo` days ago and today
function recentDate(daysAgo: number): Date {
  return faker.date.recent({ days: daysAgo });
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function seed() {
  console.log("🌱 Seeding database...");

  // Wipe existing data in the correct order (children before parents)
  // so foreign-key constraints don't reject the deletes.
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.profile.deleteMany();

  // ── 1. Profiles (team members) ──────────────────────────────────────────
  const roles = ["Admin", "Developer", "Designer", "Manager", "QA Engineer"];

  const profiles = await Promise.all(
    Array.from({ length: 12 }).map(() =>
      prisma.profile.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          role: pick(roles),
          avatarUrl: faker.image.avatarGitHub(),
          createdAt: recentDate(180),
        },
      })
    )
  );

  console.log(`  ✓ ${profiles.length} profiles`);

  // ── 2. Projects ──────────────────────────────────────────────────────────
  const projectStatuses = ["active", "completed", "pending"];

  const projects = await Promise.all(
    Array.from({ length: 8 }).map(() =>
      prisma.project.create({
        data: {
          name: faker.commerce.productName() + " " + pick(["App", "Platform", "System", "API", "Portal"]),
          status: pick(projectStatuses),
          ownerId: pick(profiles).id,
          createdAt: recentDate(120),
        },
      })
    )
  );

  console.log(`  ✓ ${projects.length} projects`);

  // ── 3. Tasks ─────────────────────────────────────────────────────────────
  const taskStatuses = ["todo", "in_progress", "review", "blocked", "done"];
  const priorities = ["low", "medium", "high", "urgent"];

  const tasks = await Promise.all(
    Array.from({ length: 60 }).map(() =>
      prisma.task.create({
        data: {
          title: faker.hacker.phrase(),
          description: faker.lorem.sentences(2),
          status: pick(taskStatuses),
          priority: pick(priorities),
          projectId: pick(projects).id,
          assignedTo: pick(profiles).id,
          dueDate: faker.date.future({ years: 0.25 }),
          createdAt: recentDate(60),
        },
      })
    )
  );

  console.log(`  ✓ ${tasks.length} tasks`);

  // ── 4. Activity logs ─────────────────────────────────────────────────────
  const actions = [
    "created",
    "updated",
    "completed",
    "commented on",
    "assigned",
    "archived",
  ];
  const entityTypes = ["task", "project"];

  const allEntities = [
    ...tasks.map((t) => ({ type: "task", id: t.id })),
    ...projects.map((p) => ({ type: "project", id: p.id })),
  ];

  const logs = await Promise.all(
    Array.from({ length: 40 }).map(() => {
      const entity = pick(allEntities);
      return prisma.activityLog.create({
        data: {
          userId: pick(profiles).id,
          action: pick(actions),
          entityType: entity.type,
          entityId: entity.id,
          createdAt: recentDate(30),
        },
      });
    })
  );

  console.log(`  ✓ ${logs.length} activity logs`);
  console.log("✅ Seed complete!");
}

// Run the seed and close the DB connection when done (or on error).
seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
