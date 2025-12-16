import { useMemo, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { formatRupees } from "@/lib/currency";
import type { Product } from "@/lib/store";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface FeaturedProductsProps {
  products: Product[];
  category: string;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  isCustomerAuthenticated: boolean;
}

export function FeaturedProducts({
  products,
  category,
  onAddToCart,
  isCustomerAuthenticated,
}: FeaturedProductsProps) {
  const [location, setLocation] = useLocation();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  // Filter products by category and sort by created_at (newest first)
  const categoryProducts = useMemo(() => {
    const filtered = products
      .filter((product) => product.category === category)
      .sort((a, b) => {
        // Sort by created_at, newest first
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    return filtered;
  }, [products, category]);

  // Get the latest product (most recent) - always visible
  const latestProduct = useMemo(() => {
    return categoryProducts.length > 0 ? categoryProducts[0] : null;
  }, [categoryProducts]);

  // Get remaining products (all except the latest) - for carousel
  const remainingProducts = useMemo(() => {
    return categoryProducts.slice(1);
  }, [categoryProducts]);

  // Auto-scroll carousel
  useEffect(() => {
    if (!carouselApi || remainingProducts.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext();
      } else {
        // Loop back to start
        carouselApi.scrollTo(0);
      }
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [carouselApi, remainingProducts.length]);

  // Don't render if no products in category
  if (categoryProducts.length === 0) {
    return null;
  }

  // Product card component
  const ProductCard = ({ product }: { product: Product }) => (
    <Card
      className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col bg-card"
      onClick={() => setLocation(`/shop/product/${product.id}`)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        {/* Default Image */}
        <img
          src={product.image.replace("w=100&h=100", "w=600&h=600")}
          alt={product.name}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            product.hover_image ? "group-hover:opacity-0" : "group-hover:scale-110"
          }`}
        />
        {/* Hover Image */}
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
            className="absolute top-3 right-3 z-10"
          >
            Out of Stock
          </Badge>
        )}
      </div>
      <CardContent className="p-5 flex-1 flex flex-col">
        <h3 className="font-display font-semibold text-lg mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
          {product.description}
        </p>
        {product.size && (
          <div className="flex flex-wrap gap-2 mb-3">
            {product.size
              .split(",")
              .map((size) => size.trim())
              .filter(Boolean)
              .map((size) => (
                <Badge key={size} variant="secondary" className="rounded-full">
                  {size}
                </Badge>
              ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-2xl font-bold text-foreground">
              {formatRupees(product.price)}
            </span>
          </div>
          <Button
            size="sm"
            className="rounded-full"
            disabled={product.quantity === 0}
            onClick={(e) => onAddToCart(product, e)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-muted/10 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Heading */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {category}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Discover our latest {category.toLowerCase()} collection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Latest Product - Static, Always Visible */}
          <div className="lg:col-span-1 order-1">
            {latestProduct && (
              <div className="relative h-full">
                <div className="absolute -top-3 -left-3 bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold z-20 shadow-lg animate-pulse">
                  ✨ Latest
                </div>
                <ProductCard product={latestProduct} />
              </div>
            )}
          </div>

          {/* Remaining Products - Scrolling Carousel */}
          <div className="lg:col-span-2 order-2">
            {remainingProducts.length > 0 ? (
              <div className="relative">
                <Carousel
                  className="w-full"
                  setApi={setCarouselApi}
                  opts={{
                    loop: remainingProducts.length > 2,
                    align: "start",
                    slidesToScroll: 1,
                    dragFree: true,
                  }}
                >
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {remainingProducts.map((product) => (
                      <CarouselItem
                        key={product.id}
                        className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/2"
                      >
                        <ProductCard product={product} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {remainingProducts.length > 1 && (
                    <>
                      <CarouselPrevious className="hidden sm:flex left-2 md:left-4 bg-background/80 backdrop-blur-sm border-2 hover:bg-background" />
                      <CarouselNext className="hidden sm:flex right-2 md:right-4 bg-background/80 backdrop-blur-sm border-2 hover:bg-background" />
                    </>
                  )}
                </Carousel>
                {/* Mobile scroll indicator */}
                {remainingProducts.length > 1 && (
                  <div className="sm:hidden flex justify-center mt-4 gap-2">
                    <div className="text-xs text-muted-foreground">
                      ← Swipe to see more →
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground border-2 border-dashed rounded-lg">
                <p className="text-center px-4">
                  More {category.toLowerCase()} products coming soon!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 md:mt-12">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full"
            onClick={() => setLocation(`/shop/products?category=${encodeURIComponent(category)}`)}
          >
            View All {category} Products
          </Button>
        </div>
      </div>
    </section>
  );
}

