// app/dashboard/products/new/product-form.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Toaster, toast } from "sonner";
import type { Resolver } from "react-hook-form";

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
import { PlusCircle, Trash2 } from "lucide-react";

// Category tipi tanımı
interface Category {
  id: string;
  name: string;
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

// Form için veri doğrulama şeması
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

// Bu bileşen, kategorileri bir prop olarak dışarıdan alır.
export function ProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema) as Resolver<ProductFormData>,
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: "",
      barcode: searchParams.get("barcode") || "",
      images: [{ url: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images",
  });

  async function onSubmit(data: ProductFormData) {
    const formattedData = {
      ...data,
      images: data.images.map((img) => img.url),
    };

    const promise = fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedData),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ürün oluşturulamadı.");
      }
      return response.json();
    });

    toast.promise(promise, {
      loading: "Ürün kaydediliyor...",
      success: () => {
        router.push("/dashboard/products");
        router.refresh();
        return `Ürün başarıyla eklendi!`;
      },
      error: (err: Error) => err.message,
    });
  }

  return (
    <>
      <Toaster richColors position="top-right" />
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
                    <Input
                      placeholder="Örn: Akıllı Telefon X1 Pro"
                      {...field}
                    />
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
                            <Input placeholder="https://..." {...inputField} />
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
                      <Input
                        placeholder="Ürün barkodunu girin veya taratın"
                        {...field}
                      />
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
                      defaultValue={field.value}
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
                        value={field.value?.toString() || ""}
                        onChange={field.onChange}
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
                        value={field.value?.toString() || ""}
                        onChange={field.onChange}
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
                      placeholder="Ürünün özelliklerini ve detaylarını buraya yazın..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Kaydediliyor..."
                  : "Ürünü Kaydet"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
