import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, X, ShoppingCart, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatRupees } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getGiftPacksForProduct, type GiftPack } from "./GiftPackSelector";

export function GiftPackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { products, categories } = useStore();
  const { toast } = useToast();

  // Get all available gift packs grouped by category
  const giftPacksByCategory = categories.reduce((acc, category) => {
    const categoryProducts = products.filter(p => p.category === category);
    if (categoryProducts.length > 0) {
      const packs = getGiftPacksForProduct(categoryProducts[0].name, category);
      if (packs.length > 0) {
        acc[category] = packs;
      }
    }
    return acc;
  }, {} as Record<string, GiftPack[]>);

  const handleGiftPackClick = (giftPack: GiftPack, category: string) => {
    // Navigate to products page filtered by category
    setLocation(`/shop/products?category=${encodeURIComponent(category)}`);
    setIsOpen(false);
    toast({
      title: "Gift Pack Selected",
      description: `Browse ${category} products to add ${giftPack.name} to your cart!`,
    });
  };

  const handleViewAllGiftPacks = () => {
    setLocation("/shop/products");
    setIsOpen(false);
    toast({
      title: "Browse Products",
      description: "Select any product to add a gift pack!",
    });
  };

  return (
    <>
      {/* Floating Gift Pack Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white z-50 flex items-center justify-center transition-all hover:scale-110"
          size="icon"
          aria-label="Gift Packs"
        >
          <Gift className="h-6 w-6" />
        </Button>
      )}

      {/* Gift Pack Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 md:right-[420px] w-[calc(100vw-3rem)] md:w-96 max-h-[600px] shadow-2xl z-50 flex flex-col border-2 border-purple-200 animate-in slide-in-from-bottom-5">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              <CardTitle className="text-lg font-bold">Gift Packs</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                Add a beautiful gift pack to make your purchase extra special!
              </p>
            </div>

            {Object.keys(giftPacksByCategory).length === 0 ? (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Gift packs are available when you view individual products.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-full"
                  onClick={handleViewAllGiftPacks}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Browse Products
                </Button>
              </div>
            ) : (
              <>
                {Object.entries(giftPacksByCategory).map(([category, packs]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      {category} Gift Packs
                    </h3>
                    <div className="space-y-2">
                      {packs.map((pack) => (
                        <Card
                          key={pack.id}
                          className="cursor-pointer hover:border-primary hover:shadow-md transition-all border"
                          onClick={() => handleGiftPackClick(pack, category)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm line-clamp-1">
                                  {pack.name}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                  {pack.description}
                                </p>
                                {pack.items && pack.items.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {pack.items.slice(0, 3).map((item, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="text-xs rounded-full"
                                      >
                                        {item}
                                      </Badge>
                                    ))}
                                    {pack.items.length > 3 && (
                                      <Badge variant="secondary" className="text-xs rounded-full">
                                        +{pack.items.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex-shrink-0 text-right">
                                <p className="font-bold text-sm text-primary">
                                  {formatRupees(pack.price)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={handleViewAllGiftPacks}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    View All Products with Gift Packs
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}

