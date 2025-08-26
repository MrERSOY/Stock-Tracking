import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { hash } from "bcryptjs";
import { or, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Test kullanıcıları oluştur
    const testUsers = [
      {
        id: "admin-test",
        name: "Admin Kullanıcı",
        email: "admin@test.com",
        password: await hash("123456", 10),
        role: "ADMIN" as const,
        emailVerified: true,
      },
      {
        id: "staff-test",
        name: "Personel Kullanıcı",
        email: "staff@test.com",
        password: await hash("123456", 10),
        role: "STAFF" as const,
        emailVerified: true,
      },
      {
        id: "customer-test",
        name: "Müşteri Kullanıcı",
        email: "customer@test.com",
        password: await hash("123456", 10),
        role: "CUSTOMER" as const,
        emailVerified: true,
      },
    ];

    // Önce mevcut test kullanıcılarını sil
    await db
      .delete(user)
      .where(
        or(
          eq(user.email, "admin@test.com"),
          eq(user.email, "staff@test.com"),
          eq(user.email, "customer@test.com")
        )
      );

    // Yeni test kullanıcılarını ekle
    await db.insert(user).values(testUsers);

    return NextResponse.json({
      success: true,
      message: "Test kullanıcıları oluşturuldu",
      users: [
        { email: "admin@test.com", password: "123456", role: "ADMIN" },
        { email: "staff@test.com", password: "123456", role: "STAFF" },
        { email: "customer@test.com", password: "123456", role: "CUSTOMER" },
      ],
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Test kullanıcıları oluşturulamadı", details: error },
      { status: 500 }
    );
  }
}
