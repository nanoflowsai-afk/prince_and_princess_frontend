import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FrontendLayout } from "@/components/layout/FrontendLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";
import { CreditCard, Lock, ArrowLeft, CheckCircle, Gift } from "lucide-react";
import { formatRupees } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { paymentsApi } from "@/lib/api";
import { LoginModal } from "@/components/LoginModal";

declare global {
  interface Window {
    Razorpay: any;
  }
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Checkout() {
  const { cart, products, getCartTotal, clearCart, isCustomerAuthenticated, customer } = useStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const cartItems = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return { ...item, product };
  }).filter((item) => item.product);

  // getCartTotal() already returns rupees (not cents)
  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + shipping + tax;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Cart is Empty",
        description: "Please add items to your cart before checkout.",
      });
      return;
    }

    // Require login
    if (!isCustomerAuthenticated || !customer?.id) {
      setShowLoginModal(true);
      setIsProcessing(false);
      return;
    }

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || 
        !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create Razorpay order
      // Total is in rupees, backend will convert to paise
      const receipt = `receipt_${Date.now()}`;
      console.log("Creating Razorpay order for amount:", total, "rupees");
      const razorpayOrder = await paymentsApi.createOrder(total, receipt, {
        cart_items: cartItems.length,
      });
      console.log("Razorpay order created:", razorpayOrder);

      // Prepare order data
      const orderData = {
        customer_id: customer.id,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email || customer.email,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_state: formData.state,
        shipping_zip: formData.zipCode,
        shipping_country: formData.country,
        items: cartItems.map(item => {
          const productPrice = item.product ? (item.product.price / 100) * item.quantity : 0;
          const giftPackPrice = item.giftPackPrice ? (item.giftPackPrice / 100) * item.quantity : 0;
          return {
            product_id: item.productId,
            product_name: item.product?.name,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            gift_pack_id: item.giftPackId,
            price: productPrice + giftPackPrice,
          };
        }),
        subtotal,
        shipping,
        tax,
        total,
      };

      // Check if Razorpay script is loaded
      if (!window.Razorpay) {
        throw new Error("Razorpay script not loaded. Please refresh the page.");
      }

      // Get Razorpay key (fallback to test key to avoid env loading issues in dev)
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_Rl21C14pJw268e";
      console.log("🔍 Debug - VITE_RAZORPAY_KEY_ID:", razorpayKey ? `${razorpayKey.substring(0, 10)}...` : "NOT FOUND");
      if (!razorpayKey) {
        throw new Error("Razorpay Key ID not configured. Please add VITE_RAZORPAY_KEY_ID to your .env file and RESTART the frontend server (Vite requires restart to load environment variables).");
      }

      // Open Razorpay checkout
      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount, // Amount in paise
        currency: razorpayOrder.currency,
        name: "Prince and Princess",
        description: `Order for ${cartItems.length} item(s)`,
        order_id: razorpayOrder.id,
        receipt: razorpayOrder.receipt,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResult = await paymentsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData,
            });

            setIsProcessing(false);
            setIsCompleted(true);
            clearCart();
            
            toast({
              title: "Payment Successful!",
              description: `Order ${verifyResult.order_id} has been confirmed.`,
            });
          } catch (error: any) {
            console.error("Payment verification error:", error);
            setIsProcessing(false);
            toast({
              variant: "destructive",
              title: "Payment Verification Failed",
              description: error.message || "Failed to verify payment. Please contact support.",
            });
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zipCode,
        },
        theme: {
          color: "#ec4899", // Pink color matching your theme
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process.",
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      
      // Handle payment failure
      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response);
        setIsProcessing(false);
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: response.error?.description || response.error?.reason || "Payment could not be processed. Please try again.",
        });
      });

      // Open Razorpay checkout
      razorpay.open();
    } catch (error: any) {
      console.error("Payment initialization error:", error);
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment. Please check your Razorpay configuration and try again.",
      });
    }
  };

  // Check authentication on mount
  useEffect(() => {
    if (!isCustomerAuthenticated && cartItems.length > 0) {
      setShowLoginModal(true);
    }
  }, [isCustomerAuthenticated, cartItems.length]);

  if (cartItems.length === 0 && !isCompleted) {
    return (
      <FrontendLayout>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto text-center border-0 shadow-lg">
            <CardContent className="p-12">
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

  if (!isCustomerAuthenticated && cartItems.length > 0) {
    return (
      <FrontendLayout>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto text-center border-0 shadow-lg">
            <CardContent className="p-12">
              <h2 className="font-display text-2xl font-bold mb-2">Please Login</h2>
              <p className="text-muted-foreground mb-8">
                You need to be logged in to proceed with checkout.
              </p>
              <Button onClick={() => setShowLoginModal(true)} className="rounded-full">
                Login / Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>
        <LoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          onSuccess={() => {
            // User logged in, can proceed
          }}
        />
      </FrontendLayout>
    );
  }

  if (isCompleted) {
    return (
      <FrontendLayout>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto text-center border-0 shadow-lg">
            <CardContent className="p-12">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-display text-3xl font-bold mb-4">Order Confirmed!</h2>
              <p className="text-muted-foreground mb-8">
                Thank you for your order. We've sent a confirmation email to {formData.email}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setLocation("/shop")} className="rounded-full">
                  Continue Shopping
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/my-orders")}
                  className="rounded-full"
                >
                  View Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </FrontendLayout>
    );
  }

  return (
    <FrontendLayout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 rounded-full"
          onClick={() => setLocation("/shop/cart")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>

        <h1 className="font-display text-4xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-display">Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        required
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => handleInputChange("country", value)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card className="border-0 shadow-sm bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Secure Payment via Razorpay
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your payment will be processed securely through Razorpay. You can pay using Credit/Debit cards, UPI, Net Banking, or Wallets.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg sticky top-24">
                <CardHeader>
                  <CardTitle className="font-display">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => {
                      const product = item.product!;
                      const productPrice = (product.price / 100) * item.quantity;
                      const giftPackPrice = item.giftPackPrice ? (item.giftPackPrice / 100) * item.quantity : 0;
                      const totalPrice = productPrice + giftPackPrice;
                      return (
                        <div key={`${item.productId}-${item.size}-${item.color}-${item.giftPackId || 'none'}`} className="flex gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                            <img
                              src={product.image.replace("w=100&h=100", "w=200&h=200")}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            {item.giftPackId && (
                              <div className="flex items-center gap-1 mt-1">
                                <Gift className="w-3 h-3 text-primary" />
                                <p className="text-xs text-primary font-semibold">Gift Pack</p>
                              </div>
                            )}
                            <div className="mt-1 space-y-0.5">
                              <p className="text-xs text-muted-foreground">
                                Product: {formatRupees(productPrice * 100)}
                              </p>
                              {item.giftPackPrice && (
                                <p className="text-xs text-primary">
                                  Gift Pack: {formatRupees(giftPackPrice * 100)}
                                </p>
                              )}
                              <p className="text-sm font-semibold">{formatRupees(totalPrice * 100)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

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
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (5% GST)</span>
                      <span className="font-medium">{formatRupees(tax * 100)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatRupees(total * 100)}</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-full"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </FrontendLayout>
  );
}

