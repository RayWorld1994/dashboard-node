// prisma.config.ts
// This file configures the Prisma CLI (migrations, client generation, etc.)
// The DATABASE_URL is loaded from your .env file via dotenv.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});
