import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await auth.api.signOut({
      headers: request.headers,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
