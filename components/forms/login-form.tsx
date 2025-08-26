"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { signIn } from "@/server/users";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email("Geçersiz e-posta"),
  password: z.string().min(8, "En az 8 karakter").max(64, "Çok uzun"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [sendingSetup, setSendingSetup] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { success, message, code } = await signIn(
        values.email,
        values.password
      );
      setLastCode(code || null);

      if (success) {
        toast.success("Giriş başarılı");
        router.replace("/dashboard");
        return;
      }

      // Hata durumları için farklı mesajlar
      switch (code) {
        case "email_unverified":
          toast.error("E-posta doğrulanmamış. Lütfen gelen kutunu kontrol et.");
          form.setError("email", { message: "E-posta doğrulanmamış" });
          break;
        case "no_password":
          toast.error(
            "Bu hesap için parola yok. Google ile giriş yapmayı dene."
          );
          form.setError("password", {
            message: "Bu hesap parola tanımlı değil",
          });
          break;
        case "invalid_credentials":
          toast.error("E-posta veya şifre hatalı");
          form.setError("password", { message: "Hatalı giriş" });
          break;
        default:
          toast.error(message || "Giriş başarısız");
          form.setError("password", { message: "Giriş başarısız" });
      }
    } catch {
      toast.error("Beklenmedik hata");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendPasswordSetupEmail() {
    const email = form.getValues("email");
    if (!email) return;
    try {
      setSendingSetup(true);
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      toast.success(
        "Parola oluşturma bağlantısı e-postana gönderildi (varsa)."
      );
    } catch {
      toast.error("İstek gönderilemedi");
    } finally {
      setSendingSetup(false);
    }
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8  "
            >
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    onClick={signInWithGoogle}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Login with Google
                  </Button>
                </div>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Email giriniz." {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3">
                    <div className="flex flex-col gap-2 ">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }: { field: any }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="********"
                                {...field}
                                type="password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Link
                        href="/forgot-password"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="animate-spin size-4" />
                    ) : (
                      "Giriş Yap"
                    )}
                  </Button>
                  {lastCode === "no_password" && (
                    <div className="rounded-md border border-dashed p-3 text-xs space-y-2">
                      <p className="text-muted-foreground m-0">
                        Bu hesap Google ile açılmış olabilir. Parola tanımlamak
                        için e-postana bir bağlantı gönderebilirsin.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={sendingSetup}
                        onClick={sendPasswordSetupEmail}
                      >
                        {sendingSetup ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          "Parola Oluşturma Bağlantısı Gönder"
                        )}
                      </Button>
                    </div>
                  )}
                  <div
                    aria-live="polite"
                    className="text-xs text-muted-foreground"
                  >
                    {isLoading && "Giriş yapılıyor..."}
                  </div>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="underline underline-offset-4">
                    Kayıt Ol
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
