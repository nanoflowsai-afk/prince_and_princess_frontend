import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface SortTile {
  id: string;
  name: string;
  imageUrl: string;
  gender: "boy" | "girl" | "baby" | "unisex" | "all";
}

const sortTiles: SortTile[] = [
  {
    id: "baby",
    name: "Baby",
    // Cute baby (days/months old) - two babies looking at something
    imageUrl: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?auto=format&fit=crop&q=80&w=200&h=200&facepad=2",
    gender: "baby",
  },
  {
    id: "girl",
    name: "Girl",
    // Cute little girl - small items/toys on white surface
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=200&h=200&facepad=2",
    gender: "girl",
  },
  {
    id: "boy",
    name: "Boy",
    // Cute little boy with colorful paint on face, smiling
    imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=200&h=200&facepad=2",
    gender: "boy",
  },
];

export function SortOptionBar() {
  return (
    <div className="sort-opt-wrapper flex items-center gap-3 md:gap-4">
      {sortTiles.map((tile) => (
        <Link
          key={tile.id}
          href={`/shop/products?gender=${tile.gender}`}
          className="sort-opt cursor-pointer flex flex-col items-center gap-1.5 group transition-all hover:scale-105 active:scale-95"
        >
          <span
            className="sort-icon w-12 h-12 md:w-14 md:h-14 rounded-full bg-cover bg-center border-2 border-slate-700 group-hover:border-pink-500 group-hover:ring-2 group-hover:ring-pink-500/30 transition-all shadow-lg"
            style={{ backgroundImage: `url(${tile.imageUrl})` }}
          />
          <span className="sort-name text-xs md:text-sm font-semibold text-slate-300 group-hover:text-pink-400 transition-colors whitespace-nowrap">
            {tile.name}
          </span>
        </Link>
      ))}
    </div>
  );
}

