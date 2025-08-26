// app/api/register/route.tsx
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user as userTable } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  createErrorResponse,
  createValidationErrorResponse,
} from "@/lib/auth-middleware";

const registerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır."),
  email: z.string().email("Geçersiz e-posta adresi."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return createValidationErrorResponse(validation.error.message);
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return new NextResponse("Bu e-posta adresi zaten kullanılıyor.", {
        status: 409,
      });
    }

    // Check if this is the first user (make them ADMIN)
    const allUsers = await db.select().from(userTable);
    const role = allUsers.length === 0 ? "ADMIN" : "CUSTOMER";

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user_${crypto.randomUUID()}`;

    const newUser = await db
      .insert(userTable)
      .values({
        id: userId,
        name,
        email,
        password: hashedPassword,
        role,
      })
      .returning({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        role: userTable.role,
        image: userTable.image,
      });

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    return createErrorResponse(error, "Kayıt işlemi başarısız");
  }
}
