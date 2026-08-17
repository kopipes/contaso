// lib/dal.ts — Data Access Layer: verified session reads
// Every function here verifies the session before returning data.
import { getSession, type SessionPayload } from "@/lib/session";
import { redirect } from "next/navigation";

/** Returns the current session or redirects to /login */
export async function verifySession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Returns the current session or null — no redirect */
export async function getOptionalSession(): Promise<SessionPayload | null> {
  return getSession();
}
