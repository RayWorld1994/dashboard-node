import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env");
}

// PrismaPg is the "driver adapter" — it lets Prisma use the `pg` package
// to talk to PostgreSQL instead of Prisma's own built-in driver.
const adapter = new PrismaPg({ connectionString });

// We export ONE shared PrismaClient for the whole app.
// Creating a new one per request would be slow and would exhaust DB connections.
export const prisma = new PrismaClient({ adapter });
