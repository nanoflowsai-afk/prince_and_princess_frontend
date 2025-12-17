import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { StoreProvider, useStore } from "@/lib/store";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/admin-products";
import Slides from "@/pages/slides";
import Offers from "@/pages/offers";
import Reviews from "@/pages/reviews";
import Users from "@/pages/users";
import Payments from "@/pages/payments";
import Settings from "@/pages/settings";
import AdminInvoices from "@/pages/admin-invoices";
import AdminOrders from "@/pages/admin-orders";
import UserInvoice from "@/pages/user-invoice";
import UserOrders from "@/pages/user-orders";
import OrderTracking from "@/pages/OrderTracking";
import Home from "@/pages/Home";
import HighlightsPage from "@/pages/highlights";
import ProductsPage from "@/pages/products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import { useEffect } from "react";

function ProtectedRoute({ component: Component, ...rest }: { component: any; [key: string]: any }) {
  const { isAuthenticated, isAdmin } = useStore();
  if (!isAuthenticated) return <Login />;
  if (!isAdmin) return <div className="p-6 text-center text-red-600 font-semibold">Unauthorized Access</div>;
  return <Component {...rest} />;
}

const UnauthorizedPage = () => (
  <div className="p-6 text-center text-red-600 font-semibold">Unauthorized Access</div>
);

function Router() {
  const { isAuthenticated, isAdmin } = useStore();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Redirect root to shop for all visitors
    if (location === "/") {
      setLocation("/shop");
    }
  }, [location, setLocation, isAuthenticated]);

  return (
    <Switch>
      {/* Frontend Routes (Public) */}
      <Route path="/shop" component={Home} />
      <Route path="/shop/products" component={ProductsPage} />
      <Route path="/shop/product/:id" component={ProductDetail} />
      <Route path="/shop/cart" component={Cart} />
      <Route path="/shop/checkout" component={Checkout} />
      <Route path="/shop/about" component={About} />
      <Route path="/shop/contact" component={Contact} />
      
      {/* Other Public Routes */}
      <Route path="/invoice/:id" component={UserInvoice} />
      <Route path="/my-orders" component={UserOrders} />
      <Route path="/track/:orderId" component={OrderTracking} />
      
      {/* Login Route */}
      <Route path="/login">
        {isAuthenticated && isAdmin ? <Dashboard /> : isAuthenticated && !isAdmin ? <UnauthorizedPage /> : <Login />}
      </Route>
      
      {/* Admin Routes (Protected) */}
      <Route path="/admin">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/admin/products">
        <ProtectedRoute component={Products} />
      </Route>
      <Route path="/admin/slides">
        <ProtectedRoute component={Slides} />
      </Route>
      <Route path="/admin/highlights">
        <ProtectedRoute component={HighlightsPage} />
      </Route>
      <Route path="/admin/offers">
        <ProtectedRoute component={Offers} />
      </Route>
      <Route path="/admin/reviews">
        <ProtectedRoute component={Reviews} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={Users} />
      </Route>
      <Route path="/admin/invoices">
        <ProtectedRoute component={AdminInvoices} />
      </Route>
      <Route path="/admin/orders">
        <ProtectedRoute component={AdminOrders} />
      </Route>
      <Route path="/admin/payments">
        <ProtectedRoute component={Payments} />
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      
      {/* Backward-compatible admin paths */}
      <Route path="/products">
        <ProtectedRoute component={Products} />
      </Route>
      <Route path="/slides">
        <ProtectedRoute component={Slides} />
      </Route>
      <Route path="/offers">
        <ProtectedRoute component={Offers} />
      </Route>
      <Route path="/reviews">
        <ProtectedRoute component={Reviews} />
      </Route>
      <Route path="/users">
        <ProtectedRoute component={Users} />
      </Route>
      <Route path="/payments">
        <ProtectedRoute component={Payments} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <ThemeProvider defaultTheme="light" storageKey="kidsstore-theme" attribute="class">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}

export default App;
