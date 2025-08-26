// app/dashboard/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AuthGuard } from "@/components/auth-guard";

// Basit Dialog bileşenleri
function Dialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-background rounded-lg shadow-lg max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
}

function DialogContent({ children }: { children: React.ReactNode }) {
  return <div className="p-6">{children}</div>;
}

function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground mt-1">{children}</p>;
}

function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-2 mt-6">{children}</div>;
}

// Basit Skeleton bileşeni
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

// Tip tanımlamaları
type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

// Veritabanından gelen kullanıcı tipi
interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  image: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole | "">("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Veritabanından kullanıcıları çek
  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error("Kullanıcılar yüklenemedi.");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu."
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
  };

  const handleCloseModal = () => {
    if (isUpdating) return;
    setSelectedUser(null);
    setNewRole("");
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    setIsUpdating(true);
    const promise = fetch(`/api/users/${selectedUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Rol güncellenemedi.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Rol güncelleniyor...",
      success: (updatedUser: User) => {
        setUsers((currentUsers) =>
          currentUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        );
        handleCloseModal();
        return `${
          updatedUser.name || "Kullanıcının"
        } rolü başarıyla güncellendi.`;
      },
      error: (err: Error) => err.message,
      finally: () => setIsUpdating(false),
    });
  };

  // TODO: Implement proper session check with better-auth
  const isAdmin = true; // Geçici olarak admin yetkisi verildi

  const roleLabels: Record<UserRole, string> = {
    ADMIN: "Yönetici",
    STAFF: "Personel",
    CUSTOMER: "Müşteri",
  };

  const roleColors: Record<UserRole, string> = {
    ADMIN: "bg-red-100 text-red-800 border-red-200",
    STAFF: "bg-blue-100 text-blue-800 border-blue-200",
    CUSTOMER: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const userRoles: UserRole[] = ["ADMIN", "STAFF", "CUSTOMER"];

  return (
    <AuthGuard requiredPermission="USERS">
      <Toaster richColors position="top-right" />
      <div>
        <h1 className="text-3xl font-bold mb-2">Kullanıcı Yönetimi</h1>
        <p className="text-muted-foreground mb-8">
          Ekip üyelerini görüntüleyin ve rollerini düzenleyin.
        </p>

        <div className="bg-card rounded-lg shadow-md border overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      // DÜZELTME: Profil fotoğrafı veya isim null (boş) olsa bile
                      // hata vermeyecek daha güvenli bir yapı kullanıldı.
                      src={
                        user.image ||
                        `https://placehold.co/40x40/e2e8f0/94a3b8?text=${(
                          user.name || "U"
                        )
                          .charAt(0)
                          .toUpperCase()}`
                      }
                      alt={user.name || "Kullanıcı Avatarı"}
                      width={40}
                      height={40}
                      className="rounded-full bg-muted"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {user.name || "İsimsiz Kullanıcı"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email || "E-posta yok"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    <Badge variant="outline" className={roleColors[user.role]}>
                      {roleLabels[user.role]}
                    </Badge>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(user)}
                      >
                        Rolü Düzenle
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Dialog open={!!selectedUser} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.name || "Kullanıcının"} rolünü düzenle
            </DialogTitle>
            <DialogDescription>
              Bu kullanıcıya yeni bir rol atayarak yetkilerini
              değiştirebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={newRole || ""}
              onValueChange={(value) => setNewRole(value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Bir rol seçin" />
              </SelectTrigger>
              <SelectContent>
                {userRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {roleLabels[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={isUpdating}
            >
              İptal
            </Button>
            <Button onClick={handleRoleChange} disabled={isUpdating}>
              {isUpdating ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
