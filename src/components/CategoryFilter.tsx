import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categoryOptions = [
  {
    id: "all",
    name: "All Products",
    emoji: "🛍️",
    bgColor: "bg-gradient-to-br from-purple-400 to-pink-400"
  },
  {
    id: "baby",
    name: "Baby",
    emoji: "👶",
    bgColor: "bg-gradient-to-br from-blue-400 to-cyan-400"
  },
  {
    id: "boy",
    name: "Boy",
    emoji: "👦",
    bgColor: "bg-gradient-to-br from-green-400 to-emerald-400"
  },
  {
    id: "girl",
    name: "Girl",
    emoji: "👧",
    bgColor: "bg-gradient-to-br from-pink-400 to-rose-400"
  }
];

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  const [location, setLocation] = useLocation();

  // Sync with URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gender = urlParams.get("gender") || "all";
    if (gender !== activeCategory) {
      onCategoryChange(gender);
    }
  }, [location, activeCategory, onCategoryChange]);

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);

    // Update URL without page reload
    const params = new URLSearchParams(window.location.search);
    if (categoryId === "all") {
      params.delete("gender");
    } else {
      params.set("gender", categoryId);
    }
    params.delete("category"); // Clear category filter when using gender filter

    const newSearch = params.toString();
    const newUrl = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname;
    setLocation(newUrl);
  };

  return (
    <div className="w-full bg-slate-50 border-b border-slate-200 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-4 md:gap-6">
          <h3 className="text-sm font-medium text-slate-600 mr-4 hidden md:block">
            Shop by Category:
          </h3>
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
            {categoryOptions.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 min-w-[80px] md:min-w-[100px] h-auto",
                  activeCategory === category.id
                    ? "bg-pink-500 text-white shadow-lg transform scale-105"
                    : "bg-white text-slate-700 hover:bg-pink-50 hover:text-pink-600 border border-slate-200 hover:border-pink-200"
                )}
              >
                <div className={cn(
                  "w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 flex items-center justify-center text-2xl shadow-inner",
                  activeCategory === category.id
                    ? "border-white bg-white/20"
                    : "border-slate-300 bg-white/90",
                  category.bgColor
                )}>
                  {category.emoji}
                </div>
                <span className={cn(
                  "text-xs md:text-sm font-medium text-center leading-tight",
                  activeCategory === category.id ? "text-white" : "text-slate-700"
                )}>
                  {category.name}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}