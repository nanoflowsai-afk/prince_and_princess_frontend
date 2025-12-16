import { useEffect, useState } from "react";
import { ordersApi, productsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Eye, MoreHorizontal } from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [productsMap, setProductsMap] = useState<Record<number, any>>({});

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, productsRes] = await Promise.all([ordersApi.getAll(), productsApi.getAll()]);
        setOrders(ordersRes || []);
        const map: Record<number, any> = {};
        (productsRes || []).forEach((p: any) => (map[p.id] = p));
        setProductsMap(map);
      } catch (e) {
        console.error("Failed to load orders or products", e);
      }
    }
    load();
  }, []);

  const filtered = orders.filter((order) => {
    const customer = (order.customer_name || "").toLowerCase();
    const matchesSearch =
      customer.includes(searchTerm.toLowerCase()) ||
      (order.order_id || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "paid":
      case "success":
        return "default";
      case "pending":
        return "secondary";
      case "processing":
        return "outline";
      default:
        return "secondary";
    }
  };

  const renderItemImage = (item: any) => {
    if (!item) return null;
    const pid = item.product_id || item.productId;
    const product = pid ? productsMap[pid] : null;
    const src = product?.image || item.image || product?.images?.[0];
    if (!src) return (
      <div className="w-12 h-12 bg-muted rounded" />
    );
    return <img src={src} alt={item.product_name || product?.name} className="w-12 h-12 object-cover rounded" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">View and manage all customer orders.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Orders</CardTitle>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("paid")}>Paid</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("processing")}>Processing</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => (
                  <TableRow key={order.id || order.order_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {renderItemImage((order.items && order.items[0]) || null)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{order.order_id}</TableCell>
                    <TableCell>{new Date(order.created_at || order.updated_at || order.created || order.date || Date.now()).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{order.customer_name}</span>
                        <span className="text-xs text-muted-foreground">{order.customer_email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{(order.items && order.items.length) || 0} items</TableCell>
                    <TableCell>₹{(order.total || order.subtotal || 0).toFixed ? (order.total || order.subtotal).toFixed(2) : order.total}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status) as any}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/invoice/${order.order_id}`}>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                          </Link>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
