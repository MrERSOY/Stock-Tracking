import { Category } from "@/db/schema";

// Hiyerarşik kategori tipi
export interface CategoryWithChildren {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  image?: string;
  children?: CategoryWithChildren[];
  productCount?: number;
}

// Slug oluşturma fonksiyonu
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Hiyerarşik kategori ağacı oluşturma
export function buildCategoryTree(
  categories: Category[]
): CategoryWithChildren[] {
  const categoryMap = new Map<string, CategoryWithChildren>();
  const rootCategories: CategoryWithChildren[] = [];

  // Tüm kategorileri map'e ekle
  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      ...cat,
      description: cat.description ?? undefined,
      parentId: cat.parentId ?? undefined,
      image: cat.image ?? undefined,
      children: [],
      level: cat.level || 0,
      sortOrder: cat.sortOrder || 0,
      isActive: cat.isActive ?? true,
    });
  });

  // Parent-child ilişkilerini kur
  categories.forEach((cat) => {
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children!.push(categoryMap.get(cat.id)!);
      }
    } else {
      rootCategories.push(categoryMap.get(cat.id)!);
    }
  });

  // Sıralama yap
  const sortCategories = (cats: CategoryWithChildren[]) => {
    cats.sort((a, b) => a.sortOrder - b.sortOrder);
    cats.forEach((cat) => {
      if (cat.children && cat.children.length > 0) {
        sortCategories(cat.children);
      }
    });
  };

  sortCategories(rootCategories);
  return rootCategories;
}

// Kategori yolu oluşturma (breadcrumb için)
export function getCategoryPath(
  categories: Category[],
  categoryId: string
): Category[] {
  const path: Category[] = [];
  let currentCategory = categories.find((cat) => cat.id === categoryId);

  while (currentCategory) {
    path.unshift(currentCategory);
    currentCategory = categories.find(
      (cat) => cat.id === currentCategory!.parentId
    );
  }

  return path;
}

// Alt kategori sayısını hesaplama
export function getChildCount(
  categories: Category[],
  categoryId: string
): number {
  return categories.filter((cat) => cat.parentId === categoryId).length;
}

// Kategori seviyesini hesaplama
export function calculateLevel(
  categories: Category[],
  parentId?: string
): number {
  if (!parentId) return 0;

  const parent = categories.find((cat) => cat.id === parentId);
  if (!parent) return 0;

  return (parent.level || 0) + 1;
}

// Benzersiz slug oluşturma
export function generateUniqueSlug(
  name: string,
  existingSlugs: string[]
): string {
  let slug = createSlug(name);
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${createSlug(name)}-${counter}`;
    counter++;
  }

  return slug;
}
