"use client";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Logout() {
  const router = useRouter();

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

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-colors"
    >
      <LogOut className="size-4" />
      Çıkış Yap
    </Button>
  );
}
