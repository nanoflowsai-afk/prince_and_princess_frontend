import { 
  ShoppingBag, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  Package,
  TrendingUp,
  Image as ImageIcon,
  Tag,
  Star,
  FileText,
  Zap
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Products", path: "/products", icon: Package },
  { label: "Slides", path: "/slides", icon: ImageIcon },
  { label: "Highlights / Features", path: "/admin/highlights", icon: Zap },
  { label: "Offers", path: "/offers", icon: Tag },
  { label: "Reviews", path: "/reviews", icon: Star },
  { label: "Users", path: "/users", icon: Users },
  { label: "Orders", path: "/admin/orders", icon: FileText },
  { label: "Invoices", path: "/admin/invoices", icon: FileText },
  { label: "Payments", path: "/payments", icon: CreditCard },
  { label: "Settings", path: "/settings", icon: Settings },
];

export const MOCK_STATS = {
  totalProducts: 124,
  totalUsers: 892,
  totalSales: 15430,
  recentOrders: 12
};

export const MOCK_INVOICE_SETTINGS = {
  storeName: "Kids Store Inc.",
  logo: "https://placehold.co/150x50?text=KidsStore",
  taxPercentage: 10,
  shippingCharge: 15,
  footerText: "Thank you for shopping with us! For support, contact support@kidsstore.com",
  address: "123 Rainbow Road, Toy Town, TT 12345",
  phone: "+1 (555) 123-4567",
  email: "hello@kidsstore.com"
};

export const MOCK_ORDERS = [
  {
    id: "ORD-2024-001",
    invoiceId: "INV-001",
    date: "2024-03-10",
    customer: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "+91 98765 43210",
      address: "42 Cotton Candy Lane, Sweetville, CA 90210"
    },
    items: [
      { productId: 1, name: "Rainbow Stacking Rings", size: "M", quantity: 1, price: 19.99 },
      { productId: 5, name: "Unicorn Plushie", size: "M", quantity: 2, price: 15.99 }
    ],
    subtotal: 51.97,
    status: "Paid",
    paymentMethod: "Credit Card"
  },
  {
    id: "ORD-2024-002",
    invoiceId: "INV-002",
    date: "2024-03-11",
    customer: {
      name: "Mike Chen",
      email: "mike.chen@example.com",
      phone: "+91 87654 32109",
      address: "88 Lego Block Blvd, Construct City, NY 10001"
    },
    items: [
      { productId: 3, name: "Dino Backpack", size: "One Size", quantity: 1, price: 35.00 }
    ],
    subtotal: 35.00,
    status: "Pending",
    paymentMethod: "PayPal"
  },
  {
    id: "ORD-2024-003",
    invoiceId: "INV-003",
    date: "2024-03-12",
    customer: {
      name: "Emma Wilson",
      email: "emma.w@example.com",
      phone: "+91 76543 21098",
      address: "12 Starry Night Way, Dreamland, TX 75001"
    },
    items: [
      { productId: 2, name: "Space Explorer Pajamas", size: "L", quantity: 1, price: 24.50 },
      { productId: 4, name: "Wooden Building Blocks", size: "S", quantity: 1, price: 42.00 }
    ],
    subtotal: 66.50,
    status: "Processing",
    paymentMethod: "Credit Card"
  }
];

export const MOCK_REVENUE_DATA = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 2780 },
  { name: "May", revenue: 1890 },
  { name: "Jun", revenue: 2390 },
  { name: "Jul", revenue: 3490 },
];

export const MOCK_PRODUCTS = [
  { id: 1, name: "Rainbow Stacking Rings", category: "Toys", price: 1999, quantity: 45, image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=100&h=100", size: "M", color: "Multi", description: "Colorful stacking rings for kids", type: "Educational", gender: "Unisex" },
  { id: 2, name: "Space Explorer Pajamas", category: "Clothing", price: 2450, quantity: 12, image: "https://images.unsplash.com/photo-1519238263496-63e36a35ceaa?auto=format&fit=crop&q=80&w=100&h=100", size: "L", color: "Blue", description: "Comfortable cotton pajamas", type: "Nightwear", gender: "Boy" },
  { id: 3, name: "Dino Backpack", category: "Accessories", price: 3500, quantity: 8, image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&q=80&w=100&h=100", size: "One Size", color: "Green", description: "Cute dinosaur backpack", type: "School", gender: "Unisex" },
  { id: 4, name: "Wooden Building Blocks", category: "Toys", price: 4200, quantity: 20, image: "https://images.unsplash.com/photo-1515488042361-25f4682ee187?auto=format&fit=crop&q=80&w=100&h=100", size: "S", color: "Wood", description: "Natural wood building blocks", type: "Construction", gender: "Unisex" },
  { id: 5, name: "Unicorn Plushie", category: "Toys", price: 1599, quantity: 100, image: "https://images.unsplash.com/photo-1556012018-50c949cb2a92?auto=format&fit=crop&q=80&w=100&h=100", size: "M", color: "White", description: "Soft unicorn plush toy", type: "Plush", gender: "Girl" },
];

export const MOCK_USERS = [
  { id: 1, name: "Sarah Johnson", email: "sarah.j@example.com", phone: "+91 98765 43210", status: "Active" },
  { id: 2, name: "Mike Chen", email: "mike.chen@example.com", phone: "+91 87654 32109", status: "Active" },
  { id: 3, name: "Emma Wilson", email: "emma.w@example.com", phone: "+91 76543 21098", status: "Inactive" },
  { id: 4, name: "David Brown", email: "david.b@example.com", phone: "+91 65432 10987", status: "Active" },
];

export const MOCK_TRANSACTIONS = [
  { id: "TRX-9871", user: "Sarah Johnson", product: "Rainbow Stacking Rings", amount: 19.99, date: "2023-10-25", status: "Completed" },
  { id: "TRX-9872", user: "Mike Chen", product: "Dino Backpack", amount: 35.00, date: "2023-10-24", status: "Completed" },
  { id: "TRX-9873", user: "Emma Wilson", product: "Space Explorer Pajamas", amount: 24.50, date: "2023-10-24", status: "Refunded" },
  { id: "TRX-9874", user: "David Brown", product: "Wooden Building Blocks", amount: 42.00, date: "2023-10-23", status: "Pending" },
];
