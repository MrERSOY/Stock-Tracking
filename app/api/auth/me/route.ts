import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // User bilgilerini role ile birlikte database'den çek
    const userWithRole = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!userWithRole || userWithRole.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userWithRole[0];

    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role || "CUSTOMER",
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { error: "Session check failed" },
      { status: 500 }
    );
  }
}
