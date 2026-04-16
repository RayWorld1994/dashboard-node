/**
 * Resolves an enriched UserContext from the JWT-authenticated request.
 *
 * The context carries everything the tool layer needs to enforce authorization:
 *   - authUserId / email / role from the JWT (already verified by middleware)
 *   - profileId / profileName resolved by matching the auth email to a Profile row
 *
 * Security note: this runs AFTER authenticateToken middleware, so req.user is
 * already JWT-verified and cannot be spoofed from the client.
 */

import type { AuthenticatedRequest } from "../middleware/auth";
import { dbGetProfileByEmail } from "../db/readonly";

export interface UserContext {
  authUserId: number;
  email: string;
  role: string;
  isAdmin: boolean;
  profileId: number | null;
  profileName: string | null;
}

export async function resolveUserContext(
  req: AuthenticatedRequest
): Promise<UserContext> {
  const { userId, email, role } = req.user!;

  // Try to find a dashboard Profile linked to this auth email.
  // An admin user might not have a Profile entry, which is fine.
  const profile = await dbGetProfileByEmail(email);

  return {
    authUserId: userId,
    email,
    role,
    isAdmin: role === "admin",
    profileId: profile?.id ?? null,
    profileName: profile?.name ?? null,
  };
}
