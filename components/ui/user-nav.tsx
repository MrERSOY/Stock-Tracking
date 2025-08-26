// components/ui/user-nav.tsx
"use client";

import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, User, Settings, LogOut, Sparkles } from "lucide-react";

export function UserNav() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Sabit default avatar URL'i
  const defaultAvatarUrl =
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format";

  // Çıkış yap fonksiyonu
  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Başarıyla çıkış yapıldı!");
      router.push("/login");
    } catch (error) {
      toast.error("Çıkış yapılırken bir hata oluştu!");
      console.error("Logout error:", error);
    }
  };

  // Oturum bilgisi yüklenirken bir "iskelet" (loading skeleton) göster
  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  // Eğer kullanıcı giriş yapmışsa (authenticated), profil menüsünü göster
  if (session?.user) {
    // Avatar için fallback baş harfleri oluştur (örn: Çağatay Ersoy -> ÇE)
    const fallbackInitials = session.user.name
      ? session.user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
      : session.user.email?.[0].toUpperCase();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-auto rounded-full px-3 gap-2 hover:bg-muted/50"
          >
            <Avatar className="h-8 w-8 ring-2 ring-primary/10">
              <AvatarImage
                src={defaultAvatarUrl}
                alt={session.user.name ?? "Kullanıcı Avatarı"}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {fallbackInitials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium leading-none">
                {session.user.name ?? "Kullanıcı"}
              </span>
              <span className="text-xs text-muted-foreground leading-none">
                {session.user.email}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.name ?? "Kullanıcı Adı"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Ayarlar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Profil
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Eğer kullanıcı giriş yapmamışsa (unauthenticated), giriş yap butonunu göster
  return (
    <div className="flex items-center gap-2">
      <Link href="/login">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105 shadow-sm"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Giriş Yap</span>
        </Button>
      </Link>
      <Link href="/signup">
        <Button
          size="sm"
          className="flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-sm bg-gradient-to-r from-primary to-primary/80"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Kayıt Ol</span>
        </Button>
      </Link>
    </div>
  );
}
