// app/dashboard/categories/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { CategoryWithChildren } from "@/lib/category-utils";
import { CategoryTree } from "@/components/CategoryTree";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, PlusCircle } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] =
    useState<string>("root");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Kategoriler yüklenemedi.");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim().length < 2) {
      toast.error("Kategori adı en az 2 karakter olmalıdır.");
      return;
    }
    setIsSubmitting(true);

    const categoryData: { name: string; parentId?: string } = {
      name: newCategoryName.trim(),
    };
    if (newCategoryParentId && newCategoryParentId !== "root") {
      categoryData.parentId = newCategoryParentId;
    }

    const promise = fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryData),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Kategori oluşturulamadı.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Kategori oluşturuluyor...",
      success: () => {
        fetchCategories(); // Kategorileri yeniden yükle
        setNewCategoryName("");
        setNewCategoryParentId("root");
        return "Kategori başarıyla oluşturuldu!";
      },
      error: (err: Error) => err.message,
      finally: () => setIsSubmitting(false),
    });
  };

  const handleDeleteCategory = (category: CategoryWithChildren) => {
    const promise = fetch(`/api/categories/${category.id}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Kategori silinemedi.");
      }
    });

    toast.promise(promise, {
      loading: "Kategori siliniyor...",
      success: () => {
        fetchCategories(); // Kategorileri yeniden yükle
        return "Kategori başarıyla silindi.";
      },
      error: (err: Error) => err.message,
    });
  };

  const handleEditCategory = (category: CategoryWithChildren) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleSaveEdit = (categoryId: string) => {
    if (editingCategoryName.trim().length < 2) {
      toast.error("Kategori adı en az 2 karakter olmalıdır.");
      return;
    }
    const promise = fetch(`/api/categories/${categoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingCategoryName.trim() }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Kategori güncellenemedi.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Güncelleniyor...",
      success: () => {
        fetchCategories(); // Kategorileri yeniden yükle
        setEditingCategoryId(null);
        return "Kategori güncellendi.";
      },
      error: (err: Error) => err.message,
    });
  };

  // Tüm kategorileri düz liste haline getir (parent seçimi için)
  const getAllCategories = (
    cats: CategoryWithChildren[]
  ): CategoryWithChildren[] => {
    let all: CategoryWithChildren[] = [];
    cats.forEach((cat) => {
      all.push(cat);
      if (cat.children && cat.children.length > 0) {
        all = all.concat(getAllCategories(cat.children));
      }
    });
    return all;
  };

  const allCategories = getAllCategories(categories);

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Yeni Kategori Ekle</CardTitle>
              <CardDescription>
                Ürünlerinizi gruplamak için yeni bir kategori oluşturun.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <Input
                  placeholder="Örn: Elektronik"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  disabled={isSubmitting}
                />
                <Select
                  value={newCategoryParentId}
                  onValueChange={setNewCategoryParentId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Üst kategori seçin (opsiyonel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="root">Ana kategori</SelectItem>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {"—".repeat(cat.level)} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  {isSubmitting ? "Ekleniyor..." : "Ekle"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Kategori Hiyerarşisi</CardTitle>
              <CardDescription>
                Kategorilerinizi hiyerarşik yapıda görüntüleyin ve yönetin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : categories.length > 0 ? (
                <CategoryTree
                  categories={categories}
                  showActions={true}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                />
              ) : (
                <p className="text-center text-muted-foreground py-10">
                  Henüz hiç kategori oluşturulmamış.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCategoryId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Kategori Düzenle</h3>
            <Input
              value={editingCategoryName}
              onChange={(e) => setEditingCategoryName(e.target.value)}
              placeholder="Kategori adı"
              className="mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setEditingCategoryId(null)}
              >
                İptal
              </Button>
              <Button onClick={() => handleSaveEdit(editingCategoryId)}>
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
