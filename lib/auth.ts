import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle";
import { nextCookies } from "better-auth/next-js";
import { schema } from "@/db/schema";
import { headers as nextHeaders } from "next/headers";
import { Resend } from "resend";
import ForgotPasswordEmail from "@/components/emails/reset-password";
import VerifyEmail from "@/components/emails/verify-email";
import { env } from "@/lib/env-validation";

const resend = new Resend(env.RESEND_API_KEY);

export const auth = betterAuth({
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // Kullanıcı doğruladıktan sonra yönleneceği başarı sayfasını ekliyoruz
      const successRedirect = "/verified";
      const verifyUrlWithRedirect =
        url +
        (url.includes("?") ? "&" : "?") +
        `redirect=${encodeURIComponent(successRedirect)}`;
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Verify your email address",
        react: VerifyEmail({
          username: user.name,
          verifyUrl: verifyUrlWithRedirect,
        }),
      });
    },
    sendOnSignUp: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Parolanızı Sıfırlayın",
        react: ForgotPasswordEmail({
          userEmail: user.email,
          username: user.name,
          resetUrl: url,
        }),
      });
    },
    requireEmailVerification: true,
  },

  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema,
  }),
  plugins: [nextCookies()], // make sure this is the last plugin in the array
});

// Helper function to get session data in API routes
export type AppSession = {
  user: { id: string; name?: string | null; email?: string | null };
} | null;

// Type for better-auth API
interface BetterAuthAPI {
  getSession: (args?: { headers?: Headers }) => Promise<AppSession>;
}

interface BetterAuthWithAPI {
  api?: BetterAuthAPI;
}

export async function getSession(input?: {
  headers?: Headers;
}): Promise<AppSession> {
  try {
    const authWithAPI = auth as unknown as BetterAuthWithAPI;
    const api = authWithAPI?.api;

    let hdrs: Headers | undefined = input?.headers;

    if (!hdrs) {
      try {
        const h = await nextHeaders();
        hdrs = h as unknown as Headers;
      } catch (error) {
        console.warn("[getSession] Failed to get headers:", error);
        hdrs = undefined;
      }
    }

    if (api && typeof api.getSession === "function") {
      // API bazı sürümlerde headers zorunlu tutuyor
      const arg = hdrs ? { headers: hdrs } : undefined;
      try {
        const s = await api.getSession(arg);
        if (s && s.user) {
          return {
            user: {
              id: s.user.id,
              name: s.user.name,
              email: s.user.email,
            },
          };
        }
      } catch (e) {
        console.warn(
          "[getSession] primary getSession failed",
          e instanceof Error ? e.message : "Unknown error"
        );
      }
    }

    // Basit cookie fallback (gelecekte iyileştirilebilir): uygun cookie varsa manuel decode yapılabilir
    // Şimdilik sadece null dönüyoruz
    return null;
  } catch (error) {
    console.error("[getSession] error", error);
    return null;
  }
}
