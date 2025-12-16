import { useLocation } from "wouter";
import { FrontendLayout } from "@/components/layout/FrontendLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";
import { formatRupees } from "@/lib/currency";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ArrowLeft, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { cart, products, updateCartItemQuantity, removeFromCart, getCartTotal, clearCart } = useStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const cartItems = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return { ...item, product };
  }).filter((item) => item.product);

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 15;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (item: { productId: number; size?: string; color?: string; giftPackId?: number }, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.productId, item.size, item.color);
    } else {
      updateCartItemQuantity(item.productId, newQuantity, item.size, item.color);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Cart is Empty",
        description: "Please add items to your cart before checkout.",
      });
      return;
    }
    setLocation("/shop/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <FrontendLayout>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto text-center border-0 shadow-lg">
            <CardContent className="p-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Start shopping to add items to your cart!
              </p>
              <Button onClick={() => setLocation("/shop/products")} className="rounded-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </FrontendLayout>
    );
  }

  return (
    <FrontendLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = item.product!;
              const productPrice = (product.price / 100) * item.quantity;
              const giftPackPrice = item.giftPackPrice ? (item.giftPackPrice / 100) * item.quantity : 0;
              const totalPrice = productPrice + giftPackPrice;

              return (
                <Card key={`${item.productId}-${item.size}-${item.color}-${item.giftPackId || 'none'}`} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0">
                        <img
                          src={product.image.replace("w=100&h=100", "w=200&h=200")}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-lg mb-1 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {product.category}
                        </p>
                        {item.size && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Size: {item.size}
                          </p>
                        )}
                        {item.color && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Color: {item.color}
                          </p>
                        )}
                        {item.giftPackId && (
                          <div className="flex items-center gap-2 mb-2">
                            <Gift className="w-4 h-4 text-primary" />
                            <p className="text-sm font-semibold text-primary">
                              Gift Pack Included
                            </p>
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Product:</span>
                            <span className="text-sm font-medium">{formatRupees(productPrice * 100)}</span>
                          </div>
                          {item.giftPackPrice && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Gift Pack:</span>
                              <span className="text-sm font-medium text-primary">{formatRupees(giftPackPrice * 100)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-1 border-t border-border">
                            <span className="text-base font-semibold">Total:</span>
                            <span className="text-lg font-bold text-foreground">{formatRupees(totalPrice * 100)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            disabled={item.quantity >= (product.quantity || 0)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            // Remove cart item - the function matches by productId, size, color, and giftPackId
                            removeFromCart(item.productId, item.size, item.color, item.giftPackId);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle className="font-display">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatRupees(subtotal * 100)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-primary">Free</span>
                      ) : (
                        formatRupees(shipping * 100)
                      )}
                    </span>
                  </div>
                  {subtotal < 50 && (
                    <p className="text-xs text-muted-foreground">
                      Add {formatRupees((50 - subtotal) * 100)} more for free shipping!
                    </p>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatRupees(tax * 100)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatRupees(total * 100)}</span>
                </div>

                <Button
                  className="w-full rounded-full"
                  size="lg"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => setLocation("/shop/products")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </FrontendLayout>
  );
}

