// app/dashboard/products/edit/[productId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2 } from "lucide-react";

// Basit Skeleton bileşeni
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

// Basit Textarea bileşeni
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

// Tip tanımlamaları
interface Category {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[] | null;
  stock: number;
  barcode: string | null;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
}

const productFormSchema = z.object({
  name: z.string().min(3, { message: "Ürün adı en az 3 karakter olmalıdır." }),
  description: z.string().optional(),
  price: z.coerce
    .number()
    .min(0, { message: "Lütfen geçerli bir fiyat girin." }),
  stock: z.coerce.number().int({ message: "Lütfen geçerli bir stok girin." }),
  categoryId: z.string().min(1, { message: "Lütfen bir kategori seçin." }),
  barcode: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url({ message: "Lütfen geçerli bir URL girin." }),
      })
    )
    .min(1, "En az bir resim URL'i eklenmelidir."),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: "",
      barcode: "",
      images: [{ url: "" }],
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoryRes, productRes] = await Promise.all([
          fetch("/api/categories"),
          fetch(`/api/products/${productId}`),
        ]);
        if (!categoryRes.ok) throw new Error("Kategoriler yüklenemedi.");
        if (!productRes.ok) throw new Error("Ürün bilgileri yüklenemedi.");
        const categoryData = await categoryRes.json();
        const productData: Product = await productRes.json();
        setCategories(categoryData);
        form.reset({
          name: productData.name,
          price: productData.price,
          stock: productData.stock,
          description: productData.description || "",
          barcode: productData.barcode || "",
          categoryId: productData.categoryId || "",
          images: (productData.images || []).map((url) => ({ url })),
        });
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    if (productId) {
      fetchData();
    }
  }, [productId, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images",
  });

  async function onSubmit(data: ProductFormData) {
    const formattedData = {
      ...data,
      images: data.images.map((img) => img.url),
    };
    const promise = fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedData),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ürün güncellenemedi.");
      }
      return response.json();
    });
    toast.promise(promise, {
      loading: "Değişiklikler kaydediliyor...",
      success: () => {
        router.push("/dashboard/products");
        router.refresh();
        return `Ürün başarıyla güncellendi!`;
      },
      error: (err: Error) => err.message,
    });
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    const promise = fetch(`/api/products/${productId}`, { method: "DELETE" });
    toast.promise(promise, {
      loading: "Ürün siliniyor...",
      success: () => {
        router.push("/dashboard/products");
        router.refresh();
        return "Ürün başarıyla silindi.";
      },
      error: (err: Error) => err.message || "Ürün silinirken bir hata oluştu.",
      finally: () => setIsDeleting(false),
    });
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Ürünü Düzenle</h2>
        </div>
        <div className="bg-card p-6 sm:p-8 rounded-lg shadow-md border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ürün Adı</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>Ürün Resimleri</FormLabel>
                <div className="space-y-4 mt-2">
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`images.${index}.url`}
                      render={({ field: inputField }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                placeholder="https://..."
                                {...inputField}
                              />
                            </FormControl>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => append({ url: "" })}
                >
                  <PlusCircle size={16} className="mr-2" />
                  Resim Ekle
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barkod</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Bir kategori seçin..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiyat (₺)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value?.toString() || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stok Adedi</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          {...field}
                          value={field.value?.toString() || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ürün Açıklaması</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ürünün özelliklerini..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between items-center mt-8 pt-5 border-t">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Bu Ürünü Sil
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bu işlem geri alınamaz. Ürün kalıcı olarak silinecektir.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Evet, Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/products")}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting
                      ? "Kaydediliyor..."
                      : "Değişiklikleri Kaydet"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="bg-card p-8 rounded-lg shadow-md border space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
