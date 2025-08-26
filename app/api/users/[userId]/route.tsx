// Dosya: app/api/users/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";

const userUpdateSchema = z.object({
  role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    // Better-auth session kontrolü
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
    }

    // Admin yetkisi kontrolü
    const currentUser = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser[0] || currentUser[0].role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Bu işlem için admin yetkisi gerekli",
        },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Kullanıcı ID gerekli" },
        { status: 400 }
      );
    }

    // Kendi rolünü değiştirmeyi engelle
    if (session.user.id === userId) {
      return NextResponse.json(
        {
          error: "Kendi rolünüzü değiştiremezsiniz",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = userUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Geçersiz rol",
          details: validation.error.message,
        },
        { status: 400 }
      );
    }

    const updatedUser = await db
      .update(user)
      .set({ role: validation.data.role })
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      });

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kullanıcı rolü başarıyla güncellendi",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("[USER_PATCH]", error);
    return NextResponse.json(
      {
        error: "Sunucu hatası",
        details: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}
