import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Category } from "@/db/schema";

interface BreadcrumbProps {
  path: Category[];
  baseUrl?: string;
}

export function Breadcrumb({
  path,
  baseUrl = "/dashboard/products",
}: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        href={baseUrl}
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4 mr-1" />
        Ana Sayfa
      </Link>

      {path.map((category, index) => (
        <div key={category.id} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {index === path.length - 1 ? (
            <span className="text-foreground font-medium">{category.name}</span>
          ) : (
            <Link
              href={`${baseUrl}/category/${category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {category.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
