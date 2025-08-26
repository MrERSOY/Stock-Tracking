"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryWithChildren } from "@/lib/category-utils";

interface CategoryTreeProps {
  categories: CategoryWithChildren[];
  onSelect?: (category: CategoryWithChildren) => void;
  selectedId?: string;
  showActions?: boolean;
  onEdit?: (category: CategoryWithChildren) => void;
  onDelete?: (category: CategoryWithChildren) => void;
}

export function CategoryTree({
  categories,
  onSelect,
  selectedId,
  showActions = false,
  onEdit,
  onDelete,
}: CategoryTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpanded(newExpanded);
  };

  const renderCategory = (
    category: CategoryWithChildren,
    level: number = 0
  ) => {
    const isExpanded = expanded.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = selectedId === category.id;

    return (
      <div key={category.id}>
        <div
          className={`flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer ${
            isSelected ? "bg-primary/10 border border-primary/20" : ""
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(category.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-6" />
            )}

            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-gray-500" />
              )
            ) : (
              <div className="w-4 h-4 rounded-full bg-gray-300" />
            )}

            <span
              className="flex-1 text-sm"
              onClick={() => onSelect?.(category)}
            >
              {category.name}
              {category.productCount !== undefined && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({category.productCount})
                </span>
              )}
            </span>
          </div>

          {showActions && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(category);
                }}
              >
                ✏️
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(category);
                }}
              >
                🗑️
              </Button>
            </div>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div>
            {category.children!.map((child) =>
              renderCategory(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {categories.map((category) => renderCategory(category))}
    </div>
  );
}
