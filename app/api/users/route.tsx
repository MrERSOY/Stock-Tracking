import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user as userTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Better-auth session kontrolü
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
    }

    // Admin yetkisi kontrolü - sadece adminler kullanıcı listesini görebilir
    const currentUser = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (!currentUser[0] || currentUser[0].role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Bu işlem için admin yetkisi gerekli",
        },
        { status: 403 }
      );
    }

    const allUsers = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        emailVerified: userTable.emailVerified,
        image: userTable.image,
        role: userTable.role,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .orderBy(userTable.createdAt);

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return NextResponse.json(
      {
        error: "Kullanıcılar yüklenemedi",
        details: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}
