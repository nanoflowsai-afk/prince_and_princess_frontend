import { useParams } from "wouter";
import { useEffect, useState } from "react";
import { ordersApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Mail } from "lucide-react";
import { Link } from "wouter";

interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
}

export default function UserInvoice() {
  const { id } = useParams();
  const { settings } = useStore(); // Use settings from store
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) {
        setError("Invalid invoice ID");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        console.log("Loading order with ID:", id);
        const data = await ordersApi.getById(id);
        console.log("Order data received:", data);
        if (mounted) {
          if (data) {
            setOrder(data);
          } else {
            setError("Order not found");
          }
        }
      } catch (err: any) {
        console.error("Failed to load order:", err);
        if (mounted) {
          setError(err.message || "Failed to load invoice");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [id]);
  
  // Fallback to store invoice settings
  const invoiceSettings = settings.invoice;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md text-center p-6">
          <CardTitle className="text-2xl font-bold mb-2">Loading Invoice...</CardTitle>
          <p className="text-muted-foreground">Please wait while we load your invoice.</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md text-center p-6">
          <CardTitle className="text-2xl font-bold text-destructive mb-2">Error Loading Invoice</CardTitle>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link href="/my-orders">
            <Button>Return to Orders</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md text-center p-6">
          <CardTitle className="text-2xl font-bold text-destructive mb-2">Invoice Not Found</CardTitle>
          <p className="text-muted-foreground mb-4">We couldn't find the invoice you're looking for.</p>
          <Link href="/my-orders">
            <Button>Return to Orders</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Calculations
  const subtotal = parseFloat(order.subtotal);
  const shipping = parseFloat(order.shipping);
  const tax = parseFloat(order.tax);
  const total = parseFloat(order.total);
  const taxAmount = tax; // Use the tax from order instead of calculating

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto print:max-w-none">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link href="/my-orders">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Orders
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Mail className="h-4 w-4" /> Email
            </Button>
            <Button size="sm" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print Invoice
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-lg overflow-hidden print:shadow-none">
          {/* Header */}
          <div className="bg-primary/5 p-8 border-b">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={invoiceSettings.logo} 
                    alt="Store Logo" 
                    className="h-12 object-contain"
                  />
                </div>
                <h1 className="text-3xl font-bold text-primary tracking-tight">INVOICE</h1>
                <p className="text-muted-foreground font-medium">#{order.invoiceId}</p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-lg">{invoiceSettings.storeName}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {invoiceSettings.address}
                  <br />
                  {invoiceSettings.phone}
                  <br />
                  {invoiceSettings.email}
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bill To</h4>
                <p className="font-bold text-lg">{order.customer_name}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line mt-1">
                  {order.shipping_address}
                  <br />
                  {order.customer_phone}
                  <br />
                  {order.customer_email}
                </p>
              </div>
              <div className="md:text-right">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Date</h4>
                  <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Order ID</h4>
                  <p className="font-medium">{order.id}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Item Description</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Size</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Qty</th>
                      <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Price</th>
                      <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item: OrderItem, index: number) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3 px-4 font-medium">
                          {item.name}
                        </td>
                        <td className="text-center py-3 px-4 text-muted-foreground">{item.size}</td>
                        <td className="text-center py-3 px-4 text-muted-foreground">{item.quantity}</td>
                        <td className="text-right py-3 px-4 text-muted-foreground">₹{item.price.toFixed(2)}</td>
                        <td className="text-right py-3 px-4 font-medium">₹{(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t text-center">
              <p className="text-muted-foreground text-sm font-medium">{invoiceSettings.footerText}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
