import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

// Remove forgotPassword if not provided by the SDK
export const { signIn, signUp, useSession, signOut } = authClient;

// Add this only if you have an API route like POST /api/auth/forgot-password
export async function forgotPassword(email: string) {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to start password reset");
  return res.json();
}
