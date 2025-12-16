import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { FrontendLayout } from "@/components/layout/FrontendLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";
import { ShoppingCart, Minus, Plus, ArrowLeft, Heart, Star, Check, Truck, Shield, RefreshCw } from "lucide-react";
import { formatRupees } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { LoginModal } from "@/components/LoginModal";
import { GiftPackSelector, getGiftPacksForProduct, type GiftPack } from "@/components/GiftPackSelector";

export default function ProductDetail() {
  const { products, addToCart, isCustomerAuthenticated } = useStore();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState<{ productId: number; quantity: number; size: string; color: string; giftPackId?: number; giftPackPrice?: number } | null>(null);
  const [selectedGiftPack, setSelectedGiftPack] = useState<GiftPack | null>(null);
  
  // Extract product ID from URL
  const productId = parseInt(location.split("/").pop() || "0");
  const product = products.find((p) => p.id === productId);
  
  // Get available gift packs for this product
  const availableGiftPacks = product ? getGiftPacksForProduct(product.name, product.category, product.type) : [];
  
  const [quantity, setQuantity] = useState(1);
  const parsedSizes = (product?.size || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const [selectedSize, setSelectedSize] = useState<string>(parsedSizes[0] || product?.size || "");
  const [selectedColor, setSelectedColor] = useState<string>(product?.color || "");

  useEffect(() => {
    if (product) {
      const sizes = (product.size || "").split(",").map(s => s.trim()).filter(Boolean);
      setSelectedSize(sizes[0] || product.size || "");
      setSelectedColor(product.color || "");
    }
  }, [product]);

  if (!product) {
    return (
      <FrontendLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/shop/products")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </FrontendLayout>
    );
  }

  const handleAddToCart = async () => {
    if (product.quantity === 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: "This product is currently out of stock.",
      });
      return;
    }

    try {
      await addToCart({
        productId: product.id,
        quantity,
        size: selectedSize,
        color: selectedColor,
        giftPackId: selectedGiftPack?.id,
        giftPackPrice: selectedGiftPack?.price,
      });

      const giftPackMessage = selectedGiftPack 
        ? ` with ${selectedGiftPack.name}` 
        : "";
      
      toast({
        title: "Added to Cart",
        description: `${product.name}${giftPackMessage} has been added to your cart.`,
      });
    } catch (error: any) {
      if (error.message === "AUTH_REQUIRED") {
        setPendingCartItem({
          productId: product.id,
          quantity,
          size: selectedSize,
          color: selectedColor,
          giftPackId: selectedGiftPack?.id,
          giftPackPrice: selectedGiftPack?.price,
        });
        setShowLoginModal(true);
      }
    }
  };

  const handleLoginSuccess = () => {
    // After successful login, wait a bit for state to update, then add the pending cart item
    if (pendingCartItem && product) {
      // Wait for customer state to be updated (React state updates are async)
      setTimeout(async () => {
        try {
          await addToCart(pendingCartItem);
          const giftPackMessage = pendingCartItem.giftPackId 
            ? ` with gift pack` 
            : "";
          toast({
            title: "Added to Cart",
            description: `${product.name}${giftPackMessage} has been added to your cart.`,
          });
          setPendingCartItem(null);
        } catch (error: any) {
          console.error("Error adding to cart after login:", error);
          if (error.message === "AUTH_REQUIRED" || error.message === "Customer ID not found") {
            // Retry after a bit more time
            setTimeout(async () => {
              try {
                await addToCart(pendingCartItem);
                const giftPackMessage = pendingCartItem.giftPackId 
                  ? ` with gift pack` 
                  : "";
                toast({
                  title: "Added to Cart",
                  description: `${product.name}${giftPackMessage} has been added to your cart.`,
                });
                setPendingCartItem(null);
              } catch (retryError: any) {
                console.error("Error adding to cart after retry:", retryError);
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Failed to add item to cart. Please try again.",
                });
              }
            }, 500);
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: error.message || "Failed to add item to cart.",
            });
          }
        }
      }, 100);
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <FrontendLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 rounded-full"
          onClick={() => setLocation("/shop/products")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="aspect-square overflow-hidden bg-muted/30">
                <img
                  src={product.image.replace("w=100&h=100", "w=800&h=800")}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
            {product.quantity === 0 && (
              <Badge variant="destructive" className="w-full justify-center py-2">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-3 bg-primary text-primary-foreground">
                {product.category}
              </Badge>
              <h1 className="font-display text-4xl font-bold mb-3">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">(24 reviews)</span>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <p className="text-3xl font-bold text-foreground">
                    {formatRupees(product.price)}
                  </p>
                  {selectedGiftPack && (
                    <Badge variant="secondary" className="text-sm">
                      + {formatRupees(selectedGiftPack.price)}
                    </Badge>
                  )}
                </div>
                {selectedGiftPack && (
                  <p className="text-lg font-semibold text-primary">
                    Total: {formatRupees(product.price + selectedGiftPack.price)}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-muted-foreground mb-6">{product.description}</p>
              
              {/* Size Selection */}
              {parsedSizes.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-semibold mb-2 block">Size</label>
                  <div className="flex gap-2 flex-wrap">
                    {parsedSizes.map((size) => {
                      // Check if this size is out of stock
                      const sizeStock = product.size_stock?.[size.trim()];
                      const isOutOfStock = sizeStock !== undefined && sizeStock <= 0;
                      const isAvailable = sizeStock === undefined || sizeStock > 0;
                      
                      return (
                        <Button
                          key={size}
                          variant={selectedSize === size ? "default" : "outline"}
                          size="sm"
                          className={`rounded-full ${
                            isOutOfStock 
                              ? "opacity-50 cursor-not-allowed line-through" 
                              : ""
                          }`}
                          disabled={isOutOfStock}
                          onClick={() => {
                            if (!isOutOfStock) {
                              setSelectedSize(size);
                            }
                          }}
                          title={isOutOfStock ? "Out of Stock" : `Available: ${sizeStock || "In Stock"}`}
                        >
                          {size}
                          {isOutOfStock && <span className="ml-1 text-xs">(OOS)</span>}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.color && product.color !== "Multi" && product.color !== "Wood" && (
                <div className="mb-6">
                  <label className="text-sm font-semibold mb-2 block">Color</label>
                  <div className="flex gap-2">
                    {["Blue", "Red", "Green", "Pink", "Yellow"].map((color) => (
                      <Button
                        key={color}
                        variant={selectedColor === color ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label className="text-sm font-semibold mb-2 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={increaseQuantity}
                    disabled={quantity >= product.quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    ({product.quantity} available)
                  </span>
                </div>
              </div>

              {/* Gift Pack Selection */}
              {availableGiftPacks.length > 0 && (
                <div className="mb-6">
                  <GiftPackSelector
                    productName={product.name}
                    productCategory={product.category}
                    availableGiftPacks={availableGiftPacks}
                    selectedGiftPack={selectedGiftPack}
                    onSelectGiftPack={setSelectedGiftPack}
                  />
                </div>
              )}

              {/* Price Summary */}
              {selectedGiftPack && (
                <Card className="mb-6 border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Product Price:</span>
                        <span className="font-medium">{formatRupees(product.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gift Pack:</span>
                        <span className="font-medium">{formatRupees(selectedGiftPack.price)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-semibold">Subtotal:</span>
                        <span className="font-bold text-lg text-primary">
                          {formatRupees((product.price + selectedGiftPack.price) * quantity)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Add to Cart */}
              <Button
                size="lg"
                className="w-full rounded-full text-lg"
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
                {selectedGiftPack && " with Gift Pack"}
              </Button>
            </div>

            <Separator />

            {/* Product Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">On orders over ₹500</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Secure Payment</p>
                  <p className="text-sm text-muted-foreground">100% secure transactions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Easy Returns</p>
                  <p className="text-sm text-muted-foreground">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h2 className="font-display text-2xl font-bold mb-4">Product Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Category</p>
                <p className="font-medium">{product.category}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Type</p>
                <p className="font-medium">{product.type}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Gender</p>
                <p className="font-medium">{product.gender}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Size</p>
                <p className="font-medium">{product.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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

