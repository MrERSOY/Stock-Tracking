"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { user, account } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

export const signIn = async (email: string, password: string) => {
  try {
    const trimmedEmail = email.trim();
    const trimmedPassword = password; // kullanıcıya göstermek için asıl parolayı değiştirmiyoruz

    // Ön-diagnostik: kullanıcı var mı?
    const existing = await db
      .select({
        id: user.id,
        emailVerified: user.emailVerified,
        userPassword: user.password,
      })
      .from(user)
      .where(eq(user.email, trimmedEmail))
      .limit(1);

    const userRow = existing[0];
    if (!userRow) {
      return {
        success: false,
        message: "Invalid credentials",
        code: "invalid_credentials",
      };
    }

    if (!userRow.emailVerified) {
      return {
        success: false,
        message:
          "E-posta doğrulanmamış. Lütfen e-postandaki doğrulama linkine tıkla.",
        code: "email_unverified",
      };
    }

    let hasPassword = !!userRow.userPassword;
    if (!hasPassword) {
      // Hesap tablosunda parola var mı (edge case)?
      const acc = await db
        .select({ id: account.id, password: account.password })
        .from(account)
        .where(and(eq(account.userId, userRow.id), isNotNull(account.password)))
        .limit(1);
      if (acc.length > 0) {
        hasPassword = true;
      }
    }
    if (!hasPassword) {
      return {
        success: false,
        message:
          "Bu hesap için parola bulunmuyor. Google ile giriş yap veya 'Şifremi Unuttum' ile parola oluştur.",
        code: "no_password",
      };
    }
    await auth.api.signInEmail({
      body: {
        email: trimmedEmail,
        password: trimmedPassword,
      },
    });
    return { success: true, message: "Sign in successful" };
  } catch (error) {
    const e = error as Error;
    if (/invalid password/i.test(e.message)) {
      console.warn("[SIGN_IN] invalid password", { email: email.trim() });
      return {
        success: false,
        message: "Invalid credentials",
        code: "invalid_credentials",
      };
    }
    console.error("[SIGN_IN] unexpected error", e.message);
    return {
      success: false,
      message: e.message || "Sign in failed",
      code: "unknown",
    };
  }
};

export const signUp = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    const trimmedEmail = email.trim();
    console.log("[SIGN_UP] Attempt", {
      email: trimmedEmail,
      username,
      hasPassword: !!password,
      dbUrl: process.env.DATABASE_URL?.slice(0, 30) + "...",
    });
    const result = await auth.api.signUpEmail({
      body: {
        email: trimmedEmail,
        password,
        name: username,
      },
    });
    console.log("[SIGN_UP] API result", result ? Object.keys(result) : null);
    return { success: true, message: "Sign up successful" };
  } catch (error) {
    const e = error as Error;
    console.error("[SIGN_UP] Failure", e);
    return {
      success: false,
      message: e.message || "Sign up failed",
      code: (e as any)?.code,
    };
  }
};
