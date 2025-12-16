import { Link, useLocation } from "wouter";
import { useState, useEffect, useMemo, useRef } from "react";
import { FrontendLayout } from "@/components/layout/FrontendLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore, type Slide } from "@/lib/store";
import { ShoppingCart, Star, Sparkles, Heart, Truck, Shield, Smile } from "lucide-react";
import { formatRupees } from "@/lib/currency";
import { ScrollingOffersBanner } from "@/components/ScrollingOffersBanner";
import { LoginModal } from "@/components/LoginModal";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { useToast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

// Mock offers for banner
const MOCK_OFFERS = [
  { id: 1, text: "World Wide Shipping Available", link: "/shop/products" },
  { id: 2, text: "Free Shipping for all orders over ₹500", link: "/shop/products" },
  { id: 3, text: "Explore our most loved collection for your most loved little ones", link: "/shop/products" },
];

export default function Home() {
  const { products, settings, categories, slides, addToCart, isCustomerAuthenticated } = useStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState<{ productId: number; quantity: number; size: string; color: string } | null>(null);
  const [highlights, setHighlights] = useState<any[]>([]);

  // Use categories from admin/store only to avoid showing deleted/inactive categories
  const displayCategories = useMemo(() => {
    return (categories || []).filter(Boolean);
  }, [categories]);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) {
      return products.slice(0, 6); // Featured products (first 6)
    }
    return products.filter(product => product.category === selectedCategory);
  }, [products, selectedCategory]);

  // Get all categories that have products for Featured Products sections
  const categoriesWithProducts = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    return categories.filter(category => {
      const categoryProducts = products.filter(p => p.category === category);
      return categoryProducts.length > 0;
    });
  }, [categories, products]);

  // Determine which slides to show: special day slides if today's date matches, otherwise normal
  const activeSlides = useMemo(() => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Filter out any slides with empty/invalid images or titles
    const validSlides = (slides: Slide[]) => {
      return slides.filter(slide => 
        slide && 
        slide.image && 
        slide.image.trim() !== "" && 
        slide.title && 
        slide.title.trim() !== "" &&
        slide.image !== "undefined" &&
        slide.title !== "undefined"
      );
    };
    
    // Check if there are any special day slides with today's date
    const validSpecialSlides = validSlides(slides.special);
    const specialSlidesForToday = validSpecialSlides.filter(
      slide => {
        if (!slide.date || slide.date.trim() === "") return false;
        // Compare dates - normalize both to YYYY-MM-DD format
        const slideDate = slide.date.trim();
        // Handle different date formats
        let normalizedSlideDate = slideDate;
        // If date includes time, extract just the date part
        if (slideDate.includes('T')) {
          normalizedSlideDate = slideDate.split('T')[0];
        }
        // If date includes time with space, extract just the date part
        if (slideDate.includes(' ')) {
          normalizedSlideDate = slideDate.split(' ')[0];
        }
        return normalizedSlideDate === todayStr;
      }
    );
    
    // Get valid normal slides
    const validNormalSlides = validSlides(slides.normal);
    
    // IMPORTANT: If there are special day slides for today, show ONLY those (even if just one)
    // Otherwise, show normal slides
    const slidesToShow = specialSlidesForToday.length > 0 ? specialSlidesForToday : validNormalSlides;
    
    // Return slides (can be empty array, one slide, or multiple slides)
    return slidesToShow;
  }, [slides]);

  // Auto-scroll-snap for carousel
  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-advance slides
  useEffect(() => {
    if (!api || activeSlides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        // Loop back to start
        api.scrollTo(0);
      }
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [api, activeSlides.length]);

  // Fetch highlights from API
  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const response = await fetch("/api/homepage/highlights");
        if (response.ok) {
          const data = await response.json();
          // Ensure highlights is always an array
          // If API returns an object, extract array or use empty array
          if (Array.isArray(data)) {
            setHighlights(data);
          } else if (data.highlights && Array.isArray(data.highlights)) {
            setHighlights(data.highlights);
          } else {
            // If API returns object with other structure, default to empty array
            setHighlights([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch highlights:", error);
        setHighlights([]); // Set to empty array on error
      }
    };

    fetchHighlights();
  }, []);

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
        const product = products.find((p) => p.id === pendingCartItem.productId);
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

  const features = (Array.isArray(highlights) ? highlights : []).map((highlight, index) => {
    let IconComponent = Truck; // default
    if (highlight.icon_type === "icon" && highlight.icon_value) {
      const iconMap: { [key: string]: any } = {
        "Truck": Truck,
        "Shield": Shield,
        "Smile": Smile,
        "Heart": Heart,
        "Star": Star,
        "Gift": Sparkles,
        "ShoppingCart": ShoppingCart,
      };
      IconComponent = iconMap[highlight.icon_value] || Truck;
    }

    const colors = [
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600", 
      "from-yellow-400 to-yellow-600",
      "from-pink-400 to-pink-600",
      "from-purple-400 to-purple-600",
      "from-indigo-400 to-indigo-600"
    ];

    return {
      icon: IconComponent,
      title: highlight.title,
      description: highlight.subtitle || "",
      image: highlight.icon_type === "image" ? highlight.image_url : null,
      color: colors[index % colors.length]
    };
  });

  return (
    <FrontendLayout
      topBanner={
        <div className="sticky top-0 z-50">
          <ScrollingOffersBanner offers={MOCK_OFFERS} />
        </div>
      }
    >

      {/* Categories Section */}
      <section className="bg-background border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              className={`rounded-full px-6 transition-colors ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-primary text-primary hover:bg-primary/10"
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              All Products
            </Button>
            {displayCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`rounded-full px-6 transition-colors ${
                  selectedCategory === category
                    ? " hover:bg-secondary/90"
                    : "border-primary text-primary hover:bg-primary/10"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Slider/Carousel */}
      {activeSlides.length > 0 && (
        <section className="relative w-full">
          <Carousel 
            className="w-full" 
            setApi={setApi}
            opts={{ 
              loop: activeSlides.length > 1, // Only loop if more than 1 slide
              align: "start",
              duration: 20,
            }}
          >
            <CarouselContent className="-ml-0">
              {activeSlides.filter(slide => slide && slide.image && slide.title).map((slide) => (
                <CarouselItem key={slide.id} className="pl-0">
                  <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-muted/30">
                    {slide.image && (
                      <img
                        src={slide.image}
                        alt={slide.title || "Slide"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide broken images
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent flex items-center">
                      <div className="container mx-auto px-4 md:px-8">
                        <div className="max-w-2xl text-white space-y-4">
                          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold">
                            {slide.title}
                          </h2>
                          {slide.description && (
                            <p className="text-lg md:text-xl text-white/90">
                              {slide.description}
                            </p>
                          )}
                          <Button
                            size="lg"
                            className="rounded-full text-lg px-8 mt-4"
                            onClick={() => {
                              if (slide.category && slide.category.trim() !== "") {
                                setSelectedCategory(slide.category);
                                // Scroll to products section
                                setTimeout(() => {
                                  document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                              } else {
                                setLocation("/shop/products");
                              }
                            }}
                          >
                            Shop Now
                            <ShoppingCart className="ml-2 w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {activeSlides.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </>
            )}
          </Carousel>
        </section>
      )}

      {/* Features Section */}
      <section className="py-12 border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-primary/40 bg-gradient-to-br from-white to-primary/5"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side - Icon/Image and Text */}
                    <div className="flex-1">
                      <div className={`w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                        {feature.image ? (
                          <img src={feature.image} alt={feature.title} className="w-7 h-7 object-cover rounded" />
                        ) : (
                          <feature.icon className="w-7 h-7 text-white" />
                        )}
                      </div>
                      <h3 className="font-display font-bold text-lg mb-2 text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                    {/* Right side - Decorative element */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                        <div className="w-6 h-6 bg-primary/20 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full -ml-8 -mb-8 group-hover:bg-primary/10 transition-colors"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Sections - One for each category with Latest Product + Carousel */}
      {categoriesWithProducts.map((category) => (
        <FeaturedProducts
          key={category}
          products={products}
          category={category}
          onAddToCart={handleAddToCart}
          isCustomerAuthenticated={isCustomerAuthenticated}
        />
      ))}

      {/* All Products / Filtered Products */}
      <section id="products-section" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {selectedCategory ? `${selectedCategory} Products` : "Featured Products"}
            </h2>
            <p className="text-muted-foreground text-lg">
              {selectedCategory 
                ? `Browse our ${selectedCategory.toLowerCase()} collection`
                : "Hand-picked favorites from our collection"
              }
            </p>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
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
                </div>
                <CardContent className="p-5">
                  <h3 className="font-display font-semibold text-lg mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>
                {product.size && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.size.split(",").map(size => size.trim()).filter(Boolean).map(size => (
                      <Badge key={size} variant="secondary" className="rounded-full">
                        {size}
                      </Badge>
                    ))}
                  </div>
                )}
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
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                No products found in this category.
              </p>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setSelectedCategory(null)}
              >
                View All Products
              </Button>
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full"
              onClick={() => setLocation("/shop/products")}
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Text and Button */}
            <div className="text-center lg:text-left">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Shopping?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl lg:max-w-none mx-auto lg:mx-0">
                Explore our full collection of premium kids' products. 
                Free shipping on orders over ₹500!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setLocation("/shop/products")}
                >
                  View All Products
                </Button>
                <Button
                  size="lg"
                  className="rounded-full text-lg px-8"
                  onClick={() => setLocation("/shop/products")}
                >
                  Browse Products
                  <ShoppingCart className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Right Side - Video */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md rounded-lg overflow-hidden shadow-lg bg-black">
                <video
                  src="/7ff3ef87-2606-4825-9bda-533812a632a2.mp4"
                  className="w-full h-auto"
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccess={handleLoginSuccess}
      />
    </FrontendLayout>
  );
}
