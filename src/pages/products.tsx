import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { FrontendLayout } from "@/components/layout/FrontendLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, Product } from "@/lib/store";
import { ShoppingCart, Search, Filter, X } from "lucide-react";
import { formatRupees } from "@/lib/currency";
import { LoginModal } from "@/components/LoginModal";
import { HeroSection } from "@/components/HeroSection";
import { useToast } from "@/hooks/use-toast";

export default function Products() {
  const { products, categories, addToCart, isCustomerAuthenticated } = useStore();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // State for filtered products and current filters
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentGender, setCurrentGender] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState<{ productId: number; quantity: number; size: string; color: string } | null>(null);

  // Track URL search params to trigger re-filtering
  const [currentSearchParams, setCurrentSearchParams] = useState<string>(window.location.search);

  // Update filters and products when URL search params or products change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gender = params.get("gender") || "all";
    const search = params.get("search") || "";
    const category = params.get("category") || "all";

    setCurrentGender(gender);
    setSearchQuery(search);
    setSelectedCategory(category);

    // Filter products based on current URL parameters
    let filtered = [...products];

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          (product.name || "").toLowerCase().includes(searchLower) ||
          (product.description || "").toLowerCase().includes(searchLower) ||
          (product.category || "").toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter((product) => product.category === category);
    }

    // Filter by gender - matches products table gender field
    if (gender !== "all") {
      filtered = filtered.filter((product) => {
        const productGender = (product.gender || "").trim().toLowerCase();
        const filterGender = gender.trim().toLowerCase();

        if (filterGender === "baby") {
          return productGender === "baby";
        }
        if (filterGender === "boy") {
          return productGender === "boy";
        }
        if (filterGender === "girl") {
          return productGender === "girl";
        }
        return false;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [currentSearchParams, products, sortBy]);

  // Listen for URL changes (including search params)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentSearchParams(window.location.search);
    };

    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleLocationChange);

    // Also check for changes on every render (for programmatic navigation)
    const currentSearch = window.location.search;
    if (currentSearch !== currentSearchParams) {
      setCurrentSearchParams(currentSearch);
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.pushState({}, "", newUrl);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setCurrentGender("all");
    setSortBy("name");
    window.history.pushState({}, "", window.location.pathname);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || currentGender !== "all" || sortBy !== "name";

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();

    if (product.quantity === 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: "This product is currently out of stock.",
      });
      return;
    }

    try {
      const sizes = (product.size || "").split(",").map((s: string) => s.trim()).filter(Boolean);
      addToCart({
        productId: product.id,
        quantity: 1,
        size: sizes[0] || product.size || "",
        color: product.color || "",
      });

      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error: any) {
      if (error.message === "AUTH_REQUIRED") {
        const sizes = (product.size || "").split(",").map((s: string) => s.trim()).filter(Boolean);
        setPendingCartItem({
          productId: product.id,
          quantity: 1,
          size: sizes[0] || product.size || "",
          color: product.color || "",
        });
        setShowLoginModal(true);
      }
    }
  };

  const handleLoginSuccess = () => {
    // After successful login, wait a bit for state to update, then add the pending cart item
    if (pendingCartItem) {
      setTimeout(async () => {
        const product = products.find((p: Product) => p.id === pendingCartItem.productId);
        if (product) {
          try {
            await addToCart(pendingCartItem);
            toast({
              title: "Added to Cart",
              description: `${product.name} has been added to your cart.`,
            });
            setPendingCartItem(null);
          } catch (error: any) {
            console.error("Error adding to cart after login:", error);
            if (error.message === "AUTH_REQUIRED" || error.message === "Customer ID not found") {
              // Retry after a bit more time
              setTimeout(async () => {
                try {
                  await addToCart(pendingCartItem);
                  toast({
                    title: "Added to Cart",
                    description: `${product.name} has been added to your cart.`,
                  });
                  setPendingCartItem(null);
                } catch (retryError: any) {
                  console.error("Error adding to cart after retry:", retryError);
                }
              }, 500);
            }
          }
        }
      }, 100);
    }
  };

  return (
    <FrontendLayout>
      {/* Hero Section */}
      <HeroSection
        title="Shop All Products"
        description="Discover our complete collection of premium kids' products. From clothing to toys, find everything your little ones need."
        ctaText="Browse Collection"
        ctaLink="/shop/products"
        height="medium"
        backgroundImage="/products.jpg"
      />

      <div className="container mx-auto px-4 py-8">

        {/* Filters */}
        <Card className="mb-8 p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10 rounded-full"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <Select 
              value={selectedCategory} 
              onValueChange={(value) => {
                const params = new URLSearchParams(window.location.search);
                if (value === "all") {
                  params.delete("category");
                } else {
                  params.set("category", value);
                }
                const newUrl = params.toString() 
                  ? `${window.location.pathname}?${params.toString()}`
                  : window.location.pathname;
                setLocation(newUrl);
              }}
            >
              <SelectTrigger className="w-full md:w-[200px] rounded-full">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: string) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Gender Filter */}
            <Select 
              value={currentGender} 
              onValueChange={(value) => {
                const params = new URLSearchParams(window.location.search);
                if (value === "all") {
                  params.delete("gender");
                } else {
                  params.set("gender", value);
                }
                const newUrl = params.toString() 
                  ? `${window.location.pathname}?${params.toString()}`
                  : window.location.pathname;
                setLocation(newUrl);
              }}
            >
              <SelectTrigger className="w-full md:w-[200px] rounded-full">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="baby">Baby</SelectItem>
                <SelectItem value="boy">Boy</SelectItem>
                <SelectItem value="girl">Girl</SelectItem>
                <SelectItem value="unisex">Unisex</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[200px] rounded-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={clearFilters}
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Products Grid - Grouped by Category */}
        {filteredProducts.length > 0 ? (
          <div className="space-y-12">
            {categories.map((category: string) => {
              const categoryProducts = filteredProducts.filter(
                (product) => product.category === category
              );

              if (categoryProducts.length === 0) return null;

              return (
                <div key={category} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="font-display text-3xl font-bold">{category}</h2>
                    <div className="flex-1 h-px bg-border"></div>
                    <Badge variant="secondary" className="text-sm">
                      {categoryProducts.length} {categoryProducts.length === 1 ? "product" : "products"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryProducts.map((product) => (
              <Card
                key={product.id}
                className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setLocation(`/shop/product/${product.id}`)}
              >
                <div className="relative aspect-square overflow-hidden bg-muted/30">
                  {/* Default Image (with model) */}
                  <img
                    src={product.image.replace("w=100&h=100", "w=600&h=600")}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${
                      product.hover_image ? "group-hover:opacity-0" : "group-hover:scale-110"
                    }`}
                  />
                  {/* Hover Image (dress alone) */}
                  {product.hover_image && (
                    <img
                      src={product.hover_image.replace("w=100&h=100", "w=600&h=600")}
                      alt={`${product.name} - Product view`}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                  )}
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground z-10">
                    {product.category}
                  </Badge>
                  {product.quantity === 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute top-3 right-3"
                    >
                      Out of Stock
                    </Badge>
                  )}
                </div>
                <CardContent className="p-5">
                  <h3 className="font-display font-semibold text-lg mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-foreground">
                        {formatRupees(product.price)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="rounded-full"
                      disabled={product.quantity === 0}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleAddToCart(product, e)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 md:p-16 text-center border-2 border-dashed">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? `We couldn't find any products matching "${searchQuery}". Try adjusting your search or filters.`
                    : "No products match your current filters. Try adjusting your search criteria."}
                </p>
              </div>
              {hasActiveFilters && (
                <Button variant="outline" className="rounded-full" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
              {searchQuery && (
                <div className="pt-4">
                  <Button
                    variant="default"
                    className="rounded-full"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setCurrentGender("all");
                      setSortBy("name");
                      window.history.pushState({}, "", window.location.pathname);
                    }}
                  >
                    View All Products
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccess={handleLoginSuccess}
      />
    </FrontendLayout>
  );
}

