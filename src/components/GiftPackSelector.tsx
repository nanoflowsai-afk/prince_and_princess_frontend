import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Check, X } from "lucide-react";
import { formatRupees } from "@/lib/currency";

export interface GiftPack {
  id: number;
  name: string;
  description: string;
  price: number; // in cents
  image?: string;
  items?: string[]; // List of items included in the pack
}

interface GiftPackSelectorProps {
  productName: string;
  productCategory: string;
  availableGiftPacks: GiftPack[];
  selectedGiftPack: GiftPack | null;
  onSelectGiftPack: (giftPack: GiftPack | null) => void;
}

export function GiftPackSelector({
  productName,
  productCategory,
  availableGiftPacks,
  selectedGiftPack,
  onSelectGiftPack,
}: GiftPackSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (availableGiftPacks.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Add Gift Pack</h3>
              <p className="text-sm text-muted-foreground">
                Complete the perfect gift with a matching gift pack
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <X className="w-4 h-4" />
            ) : (
              <Gift className="w-4 h-4" />
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-3 mt-4">
            {availableGiftPacks.map((giftPack) => {
              const isSelected = selectedGiftPack?.id === giftPack.id;
              return (
                <Card
                  key={giftPack.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "border-2 border-primary shadow-md bg-primary/5"
                      : "border border-border hover:border-primary/50 hover:shadow-sm"
                  }`}
                  onClick={() => onSelectGiftPack(isSelected ? null : giftPack)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {giftPack.image && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                          <img
                            src={giftPack.image}
                            alt={giftPack.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-display font-semibold text-base">
                                {giftPack.name}
                              </h4>
                              {isSelected && (
                                <Badge className="bg-primary text-primary-foreground">
                                  <Check className="w-3 h-3 mr-1" />
                                  Selected
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {giftPack.description}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-foreground">
                              {formatRupees(giftPack.price)}
                            </p>
                          </div>
                        </div>
                        {giftPack.items && giftPack.items.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">
                              Includes:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {giftPack.items.map((item, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs rounded-full"
                                >
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {selectedGiftPack && (
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Selected: {selectedGiftPack.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  +{formatRupees(selectedGiftPack.price)} will be added to your order
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => onSelectGiftPack(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to get gift packs for a product based on category/type
export function getGiftPacksForProduct(
  productName: string,
  productCategory: string,
  productType?: string
): GiftPack[] {
  // Mock gift packs - In a real app, this would come from an API
  const allGiftPacks: Record<string, GiftPack[]> = {
    Clothing: [
      {
        id: 1,
        name: "Premium Clothing Gift Pack",
        description: "Complete gift set with matching accessories and gift box",
        price: 29900, // ₹299 in cents
        items: ["Gift Box", "Ribbon", "Gift Card", "Tissue Paper"],
      },
      {
        id: 2,
        name: "Deluxe Clothing Gift Pack",
        description: "Premium gift pack with additional accessories",
        price: 49900, // ₹499 in cents
        items: ["Premium Gift Box", "Ribbon", "Gift Card", "Tissue Paper", "Thank You Card"],
      },
    ],
    Frock: [
      {
        id: 3,
        name: "Frock Gift Pack",
        description: "Perfect gift pack for frocks with matching accessories",
        price: 34900, // ₹349 in cents
        items: ["Gift Box", "Ribbon", "Gift Card", "Tissue Paper"],
      },
    ],
    default: [
      {
        id: 4,
        name: "Standard Gift Pack",
        description: "Beautiful gift pack with gift box and accessories",
        price: 19900, // ₹199 in cents
        items: ["Gift Box", "Ribbon", "Gift Card"],
      },
    ],
  };

  // Try to find category-specific packs
  const categoryPacks = allGiftPacks[productCategory] || allGiftPacks[productName] || [];
  
  // If no category-specific packs, use default
  if (categoryPacks.length > 0) {
    return categoryPacks;
  }

  return allGiftPacks.default || [];
}

