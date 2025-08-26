import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";

export async function GET() {
  try {
    // Tüm kullanıcıları getir (şifre hariç)
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      })
      .from(user);

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users,
      adminCount: users.filter((u) => u.role === "ADMIN").length,
      staffCount: users.filter((u) => u.role === "STAFF").length,
      customerCount: users.filter((u) => u.role === "CUSTOMER").length,
    });
  } catch (error) {
    console.error("Debug users error:", error);
    return NextResponse.json(
      { error: "Kullanıcılar getirilemedi", details: error },
      { status: 500 }
    );
  }
}
