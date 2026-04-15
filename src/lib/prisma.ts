// Re-export the shared client from its canonical location.
// Existing code that imports from here continues to work.
export { prisma } from "../db/client";
