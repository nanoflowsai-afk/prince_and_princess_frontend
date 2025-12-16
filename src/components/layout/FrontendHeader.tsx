import { Link, useLocation } from "wouter";
import { useState } from "react";
import { ShoppingCart, Menu, X, Moon, Sun, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useStore } from "@/lib/store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { LoginModal } from "@/components/LoginModal";
import { cn } from "@/lib/utils";

export function FrontendHeader() {
  const { theme, setTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const { getCartItemCount, settings, isCustomerAuthenticated, customer, customerLogout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const cartItemCount = getCartItemCount();

  const navItems = [
    { label: "Home", path: "/shop" },
    { label: "Products", path: "/shop/products" },
    { label: "About", path: "/shop/about" },
    { label: "Contact", path: "/shop/contact" },
    { label: "Orders", path: "/my-orders" },
  ];

  const isActive = (path: string) => location === path || location.startsWith(path + "/");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4 box-border">
        {/* Logo - Left */}
        <Link href="/shop" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0">
          <img 
            src="/prince-logo-01-png-final.png" 
            alt={settings.storeName} 
            className="h-8 md:h-10 w-auto object-contain" 
          />
        </Link>

        {/* Desktop Navigation - Center */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-md">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full px-3 py-2 font-medium transition-all text-sm",
                  isActive(item.path)
                    ? "bg-pink-500 text-white shadow-md hover:bg-pink-600"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Category Options - Compact */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link href="/shop/products" className="group">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-2 py-1 h-8 text-xs font-medium text-slate-300 hover:text-pink-400 hover:bg-slate-800/50 transition-all flex items-center gap-1"
            >
              🛍️ All
            </Button>
          </Link>
          <Link href="/shop/products?gender=baby" className="group">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-2 py-1 h-8 text-xs font-medium text-slate-300 hover:text-pink-400 hover:bg-slate-800/50 transition-all flex items-center gap-1"
            >
              👶 Baby
            </Button>
          </Link>
          <Link href="/shop/products?gender=boy" className="group">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-2 py-1 h-8 text-xs font-medium text-slate-300 hover:text-pink-400 hover:bg-slate-800/50 transition-all flex items-center gap-1"
            >
              👦 Boy
            </Button>
          </Link>
          <Link href="/shop/products?gender=girl" className="group">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-2 py-1 h-8 text-xs font-medium text-slate-300 hover:text-pink-400 hover:bg-slate-800/50 transition-all flex items-center gap-1"
            >
              👧 Girl
            </Button>
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
          {/* Search - Hidden on small screens */}
          <div className="hidden md:flex items-center relative max-w-xs w-48 lg:w-56">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 z-10 flex-shrink-0" />
            <Input
              placeholder="Search..."
              className="pl-9 pr-3 rounded-full border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-400 focus:bg-slate-800 focus:border-pink-500 text-sm h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery) {
                  setLocation(`/shop/products?search=${encodeURIComponent(searchQuery)}`);
                }
              }}
            />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-slate-800 text-slate-300 hover:text-white border border-pink-500/30 h-9 w-9"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Auth */}
            {isCustomerAuthenticated && customer ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-200 px-2 py-1 rounded-full bg-slate-800/60 border border-pink-500/30 truncate max-w-20">
                  {customer.name?.split(' ')[0] || "Account"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-slate-300 hover:text-white hover:bg-slate-800 border border-pink-500/30 h-9 px-3"
                  onClick={() => customerLogout()}
                >
                  <LogOut className="h-3 w-3" />
                  <span className="hidden lg:inline ml-1 text-xs">Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-slate-300 hover:text-white hover:bg-slate-800 border border-pink-500/30 h-9 px-3"
                onClick={() => setShowLoginModal(true)}
              >
                <User className="h-3 w-3" />
                <span className="hidden lg:inline ml-1 text-xs">Login</span>
              </Button>
            )}

            {/* Cart */}
            <Link href="/shop/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full hover:bg-slate-800 text-slate-300 hover:text-white border border-pink-500/30 h-9 w-9"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-pink-500 text-white">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </Badge>
                )}
                <span className="sr-only">Shopping cart</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full hover:bg-slate-800 text-slate-300 hover:text-white border border-pink-500/30 h-9 w-9">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-slate-900 border-slate-800 p-0">
              <div className="p-6">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-3 text-white mb-6">
                    <img 
                      src="/prince-logo-01-png-final.png" 
                      alt={settings.storeName} 
                      className="h-8 w-auto object-contain" 
                    />
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Search */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 relative">
                    <Search className="absolute left-3 w-4 h-4 text-slate-400 z-10" />
                    <Input
                      placeholder="Search products..."
                      className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 h-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchQuery) {
                          setLocation(`/shop/products?search=${encodeURIComponent(searchQuery)}`);
                          setMobileMenuOpen(false);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Mobile Sort Options */}
                <div className="mb-6 pb-4 border-b border-slate-700">
                  <p className="text-sm font-semibold mb-3 text-slate-300">Shop By Category</p>
                  <div className="flex gap-2">
                    <Link href="/shop/products" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                      <Button variant="outline" className="w-full rounded-full border-pink-500/40 text-white hover:bg-pink-500/20 h-10">
                        🛍️ All
                      </Button>
                    </Link>
                    <Link href="/shop/products?gender=baby" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                      <Button variant="outline" className="w-full rounded-full border-pink-500/40 text-white hover:bg-pink-500/20 h-10">
                        👶 Baby
                      </Button>
                    </Link>
                    <Link href="/shop/products?gender=boy" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                      <Button variant="outline" className="w-full rounded-full border-pink-500/40 text-white hover:bg-pink-500/20 h-10">
                        👦 Boy
                      </Button>
                    </Link>
                    <Link href="/shop/products?gender=girl" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                      <Button variant="outline" className="w-full rounded-full border-pink-500/40 text-white hover:bg-pink-500/20 h-10">
                        👧 Girl
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-2 mb-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start rounded-full h-11",
                          isActive(item.path)
                            ? "bg-pink-500 text-white hover:bg-pink-600"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </nav>

                {/* Mobile Auth & Cart */}
                <div className="flex gap-2">
                  {isCustomerAuthenticated && customer ? (
                    <>
                      <div className="flex-1 text-center py-2 px-3 rounded-lg bg-slate-800/60 border border-pink-500/30">
                        <p className="text-sm text-slate-200 font-medium truncate">{customer.name || "Account"}</p>
                      </div>
                      <Button
                        variant="outline"
                        className="flex-1 rounded-full border-pink-500/40 text-white hover:bg-pink-500/20 h-11"
                        onClick={() => {
                          customerLogout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="default"
                      className="flex-1 rounded-full bg-pink-500 hover:bg-pink-600 text-white h-11"
                      onClick={() => {
                        setShowLoginModal(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  )}
                </div>

                {/* Cart in mobile menu */}
                <Link href="/shop/cart" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full mt-3 rounded-full border border-pink-500/30 text-slate-300 hover:text-white hover:bg-slate-800 h-11"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                    {cartItemCount > 0 && (
                      <Badge className="ml-2 bg-pink-500 text-white">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </header>
  );
}

