import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Truck, FileText, Package } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { productsApi } from "@/lib/api";

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
}

export default function UserOrders() {
  const { orders, getCustomerOrders, isCustomerAuthenticated, customer } = useStore();
  const myOrders = orders || [];
  const [productCache, setProductCache] = useState<Record<number, Product>>({});

  // Load orders when component mounts
  useEffect(() => {
    if (isCustomerAuthenticated && customer?.id) {
      getCustomerOrders();
    }
  }, [isCustomerAuthenticated, customer?.id, getCustomerOrders]);

  // Load product details for images
  useEffect(() => {
    const loadProductDetails = async () => {
      const productIds = new Set<number>();
      myOrders.forEach(order => {
        order.items.forEach((item: any) => {
          if (item.product_id && !productCache[item.product_id]) {
            productIds.add(item.product_id);
          }
        });
      });

      const promises = Array.from(productIds).map(async (productId) => {
        try {
          const product = await productsApi.getById(productId);
          return { productId, product };
        } catch (error) {
          console.error(`Failed to load product ${productId}:`, error);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const newCache: Record<number, Product> = {};
      results.forEach(result => {
        if (result) {
          newCache[result.productId] = result.product;
        }
      });

      setProductCache(prev => ({ ...prev, ...newCache }));
    };

    if (myOrders.length > 0) {
      loadProductDetails();
    }
  }, [myOrders, productCache]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "default";
      case "shipped": return "secondary";
      case "processing": return "outline";
      case "paid": return "default";
      case "pending": return "secondary";
      case "cancelled": return "destructive";
      case "failed": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return <Package className="h-4 w-4" />;
      case "shipped": return <Truck className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getFirstProductImage = (order: any) => {
    const firstItem = order.items[0];
    if (firstItem && firstItem.product_id && productCache[firstItem.product_id]) {
      return productCache[firstItem.product_id].image;
    }
    return "/placeholder-product.jpg"; // Fallback image
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">My Orders</h1>
            <p className="text-muted-foreground">View your order history and track your purchases.</p>
          </div>
          <Link href="/">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>

        {myOrders.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                You haven't placed any orders yet. Start shopping to see your orders here.
              </p>
              <Link href="/">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myOrders.map((order) => (
              <Card key={order.id} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={getFirstProductImage(order)}
                        alt="Product"
                        className="w-16 h-16 object-cover rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
                        }}
                      />
                      <div>
                        <CardTitle className="text-lg">Order #{order.order_id.split('_')[1]}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(order.status) as any} className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items:</span>
                      <span className="font-medium">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-lg">₹{parseFloat(order.total).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/invoice/${order.order_id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <FileText className="h-4 w-4" />
                        Invoice
                      </Button>
                    </Link>
                    <Link href={`/track/${order.order_id}`} className="flex-1">
                      <Button size="sm" className="w-full gap-2">
                        <Truck className="h-4 w-4" />
                        Track
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
