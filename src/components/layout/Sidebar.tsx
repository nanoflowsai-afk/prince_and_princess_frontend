import { Link, useLocation } from "wouter";
import { NAV_ITEMS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useStore } from "@/lib/store";

export function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
  const [location] = useLocation();
  const { logout } = useStore();

  return (
    <aside className={cn(
      "flex h-full flex-col bg-sidebar text-sidebar-foreground z-30",
      isMobile ? "w-full border-none" : "hidden md:flex w-64 fixed left-0 top-0 border-r border-sidebar-border"
    )}>
      <div className="p-6 flex items-center gap-3">
        <img src="/prince-logo-01-png-final.png" alt="Kids Store Logo" className="w-10 h-10 rounded-xl shadow-sm" />
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md scale-[1.02]"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-[1.02]"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "animate-pulse-soft" : "")} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-sidebar-border">
        <div 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </div>
      </div>
    </aside>
  );
}
