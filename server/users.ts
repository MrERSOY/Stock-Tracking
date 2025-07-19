"use server";

import { auth } from "@/lib/auth";

export const signIn = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
    return { success: true, message: "Sign in successful" };
  } catch (error) {
    const e = error as Error;
    return { success: false, message: e.message || "Sign in failed" };
  }
};

export const signUp = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: username,
      },
    });
    return { success: true, message: "Sign up successful" };
  } catch (error) {
    const e = error as Error;
    return { success: false, message: e.message || "Sign up failed" };
  }
};
