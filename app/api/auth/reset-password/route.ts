import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token ve yeni şifre gerekli" },
        { status: 400 }
      );
    }

    // Better-auth reset password endpoint'ini kullan
    const response = await auth.api.resetPassword({
      body: { token, newPassword: password },
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Şifre sıfırlanırken hata oluştu" },
      { status: 500 }
    );
  }
}
