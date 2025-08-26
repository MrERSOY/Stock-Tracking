import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "E-posta adresi gerekli" },
        { status: 400 }
      );
    }

    // Better-auth forgot password endpoint'ini kullan
    const response = await auth.api.forgetPassword({
      body: { email },
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Şifre sıfırlama e-postası gönderilirken hata oluştu" },
      { status: 500 }
    );
  }
}
