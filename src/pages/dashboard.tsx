import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { ShoppingBag, Users, CreditCard, TrendingUp, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";

import { useLocation } from "wouter";

export default function Dashboard() {
  const { stats, transactions, revenueData, activeNow } = useStore();
  const [, setLocation] = useLocation();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-lg shadow-pink-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
              <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                <CreditCard className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display text-foreground">₹{stats.totalSales.toLocaleString('en-IN')}</div>
              <p className="text-xs text-green-600 flex items-center mt-1 font-bold">
                <TrendingUp className="h-3 w-3 mr-1" /> +{stats.salesGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg shadow-green-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display text-foreground">{stats.totalUsers}</div>
              <p className="text-xs text-green-600 flex items-center mt-1 font-bold">
                <TrendingUp className="h-3 w-3 mr-1" /> +{stats.usersGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg shadow-yellow-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display text-foreground">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                4 products low in stock
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg shadow-purple-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display text-foreground">+{activeNow}</div>
              <p className="text-xs text-green-600 flex items-center mt-1 font-bold">
                <TrendingUp className="h-3 w-3 mr-1" /> +{stats.activeGrowth} since last hour
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          {/* Chart */}
          <Card className="col-span-4 border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-display">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `₹${value}`} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="col-span-3 border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-display">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {transactions.slice(0, 4).map((trx) => (
                  <div key={trx.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white shadow-sm
                        ${trx.status === 'Completed' ? 'bg-green-500' : trx.status === 'Refunded' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{trx.product}</p>
                        <p className="text-xs text-muted-foreground">{trx.user}</p>
                      </div>
                    </div>
                    <div className="font-bold font-display text-sm">
                      ₹{trx.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary"
                  onClick={() => setLocation("/payments")}
                >
                  View All Transactions <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
