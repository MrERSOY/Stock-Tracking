// lib/auth-middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession, AppSession } from "@/lib/auth";

export interface AuthenticatedRequest extends NextRequest {
  user: NonNullable<AppSession>["user"];
}

/**
 * API Route authentication middleware
 * Usage: const { session, user } = await requireAuth(request);
 */
export async function requireAuth(request: NextRequest): Promise<{
  session: NonNullable<AppSession>;
  user: NonNullable<AppSession>["user"];
}> {
  try {
    const session = await getSession({ headers: request.headers });

    if (!session || !session.user) {
      throw new AuthError("Unauthorized - No valid session", 401);
    }

    return { session, user: session.user };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error("[requireAuth] Session validation failed:", error);
    throw new AuthError("Authentication failed", 401);
  }
}

/**
 * Role-based authorization middleware
 */
export async function requireRole(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  allowedRoles: string[] = ["ADMIN", "STAFF"]
): Promise<{
  session: NonNullable<AppSession>;
  user: NonNullable<AppSession>["user"];
}> {
  const { session, user } = await requireAuth(request);

  // Note: Role check will be implemented when user role is added to session
  // For now, just return authenticated user
  // TODO: Add role validation once user.role is available in session
  // Currently allowedRoles parameter is prepared for future implementation

  return { session, user };
}

/**
 * Custom authentication error class
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
    public code: string = "UNAUTHORIZED"
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Safe error response helper - never leaks internal details
 */
export function createErrorResponse(
  error: unknown,
  fallbackMessage: string = "Internal Server Error"
) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Log internal errors but don't expose them
  console.error("[API Error]", error);

  return NextResponse.json(
    {
      error: fallbackMessage,
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}

/**
 * Validation error response
 */
export function createValidationErrorResponse(message: string) {
  return NextResponse.json(
    {
      error: message,
      code: "VALIDATION_ERROR",
    },
    { status: 400 }
  );
}
