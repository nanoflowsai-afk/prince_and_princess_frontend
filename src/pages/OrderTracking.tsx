import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import { Link } from "wouter";
import { ordersApi } from "@/lib/api";

interface Order {
  id: number;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  items: any[];
  total: string;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

const statusSteps = [
  { status: "pending", label: "Order Placed", icon: Clock, description: "Your order has been received" },
  { status: "processing", label: "Processing", icon: Package, description: "We're preparing your order" },
  { status: "paid", label: "Payment Confirmed", icon: CheckCircle, description: "Payment has been verified" },
  { status: "shipped", label: "Shipped", icon: Truck, description: "Your order is on the way" },
  { status: "delivered", label: "Delivered", icon: CheckCircle, description: "Order delivered successfully" },
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [, setLocation] = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;

      try {
        setLoading(true);
        const data = await ordersApi.getById(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const getCurrentStepIndex = (status: string) => {
    return statusSteps.findIndex(step => step.status === status.toLowerCase());
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/my-orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
          <Card className="border-none shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Order Not Found</h3>
              <p className="text-muted-foreground text-center mb-6">
                {error || "The order you're looking for doesn't exist or has been removed."}
              </p>
              <Link href="/my-orders">
                <Button>View My Orders</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex(order.status);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/my-orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Track Order</h1>
            <p className="text-muted-foreground">Order #{order.order_id.split('_')[1]}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Order Status Timeline */}
          <div className="md:col-span-2">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.status} className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                              {step.label}
                            </h4>
                            {isCurrent && (
                              <Badge variant="secondary" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          {isCompleted && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {index === currentStepIndex ? 'In progress' : 'Completed'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div>
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Status</p>
                  <Badge variant={getStatusColor(order.status) as any} className="mt-1">
                    {order.status}
                  </Badge>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                  <p className="text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items</p>
                  <p className="text-sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-bold">₹{parseFloat(order.total).toFixed(2)}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-muted-foreground whitespace-pre-line">{order.shipping_address}</p>
                      {order.customer_phone && (
                        <p className="text-muted-foreground">{order.customer_phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href={`/invoice/${order.order_id}`}>
                    <Button className="w-full">
                      View Invoice
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}