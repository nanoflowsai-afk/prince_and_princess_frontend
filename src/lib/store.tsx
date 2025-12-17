import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MOCK_REVENUE_DATA, MOCK_STATS } from "./mockData";
import { useToast } from "@/hooks/use-toast";
import { productsApi, categoriesApi, slidesApi, usersApi, transactionsApi, settingsApi, customerApi, cartApi } from "./api";

// SVG data URI for boy avatar (blue background)
const boyAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%233b82f6'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='white' text-anchor='middle' dominant-baseline='middle' font-family='Arial, sans-serif' font-weight='bold'%3EBoy%3C/text%3E%3C/svg%3E";

// Define types for our data
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number; // stored in cents in DB, but we'll convert
  quantity: number;
  size?: string | null;
  size_stock?: Record<string, number> | null; // Stock per size: {"16": 5, "18": 0}
  color?: string | null;
  description?: string | null;
  type?: string | null;
  gender?: string | null;
  image: string;
  hover_image?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: number;
  transaction_id: string;
  user_id: number;
  user_name: string;
  product_id: number;
  product_name: string;
  amount: number;
  date: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
  giftPackId?: number;
  giftPackPrice?: number; // in cents
}

export interface Slide {
  id: number;
  title: string;
  description: string | null;
  image: string;
  date: string | null;
  category?: string | null;
  type?: "special" | "normal";
}

export interface Customer {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface StoreState {
  products: Product[];
  users: User[];
  transactions: Transaction[];
  revenueData: typeof MOCK_REVENUE_DATA;
  activeNow: number;
  stats: typeof MOCK_STATS & {
    salesGrowth: number;
    usersGrowth: number;
    activeGrowth: number;
  };
  settings: {
    storeName: string;
    maintenanceMode: boolean;
    notifications: Record<string, boolean>;
    adminAvatar: string;
    invoice: {
      storeName: string;
      logo: string;
      taxPercentage: number;
      shippingCharge: number;
      footerText: string;
      address: string;
      email: string;
      phone: string;
    };
  };
  categories: string[];
  isAuthenticated: boolean;
  admin: any | null;
  isAdmin: boolean;
  customer: Customer | null;
  isCustomerAuthenticated: boolean;
  cart: CartItem[];
  slides: {
    special: Slide[];
    normal: Slide[];
  };
  likedProducts: number[];
  orders: any[];
  isLoading: boolean;
}

interface StoreContextType extends StoreState {
  login: (user?: any) => void;
  adminLogin: (email: string, password: string) => Promise<any>;
  logout: () => void;
  customerLogin: (email: string, password: string) => Promise<void>;
  customerRegister: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  customerLogout: () => void;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  updateUser: (id: number, user: Partial<User>) => Promise<void>;
  toggleMaintenanceMode: () => Promise<void>;
  toggleNotification: (key: string) => Promise<void>;
  updateStoreName: (name: string) => Promise<void>;
  updateAdminAvatar: (avatar: string) => Promise<void>;
  updateInvoiceSettings: (settings: Partial<StoreState["settings"]["invoice"]>) => Promise<void>;
  addCategory: (category: string) => Promise<void>;
  updateCategory: (oldCategory: string, newCategory: string) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number, size?: string, color?: string, giftPackId?: number) => void;
  updateCartItemQuantity: (productId: number, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  addSlide: (type: 'special' | 'normal', slide: Omit<Slide, "id">) => Promise<void>;
  updateSlide: (type: 'special' | 'normal', id: number, updates: Partial<Slide>) => Promise<void>;
  deleteSlide: (type: 'special' | 'normal', id: number) => Promise<void>;
  refreshData: () => Promise<void>;
  toggleLikeProduct: (productId: number) => Promise<void>;
  getLikedProducts: () => Promise<void>;
  getCustomerOrders: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Initialize state - empty arrays, will be loaded from API
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [slides, setSlides] = useState<{ special: Slide[]; normal: Slide[] }>({
    special: [],
    normal: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize authentication from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = localStorage.getItem("isAuthenticated");
    return stored === "true";
  });
  const [admin, setAdmin] = useState<any | null>(() => {
    const stored = localStorage.getItem("admin");
    return stored ? JSON.parse(stored) : null;
  });
  const isAdmin = !!admin && (admin.role || "").toLowerCase() === "admin";
  
  // Default settings (will be loaded from DB)
  const [settings, setSettings] = useState<StoreState["settings"]>({
    storeName: "Prince and Princess",
    maintenanceMode: false,
    notifications: {
      "New Order Received": true,
      "Product Low Stock Alert": true,
      "New User Registration": true,
      "Refund Request": true,
      "Daily Summary Email": true
    } as Record<string, boolean>,
    adminAvatar: boyAvatar,
    invoice: {
      storeName: "Prince and Princess",
      logo: "https://placehold.co/150x50?text=KidsStore",
      taxPercentage: 10,
      shippingCharge: 15,
      footerText: "Thank you for shopping with us!",
      address: "123 Rainbow Road, Toy Town",
      email: "hello@princeandprincess.com",
      phone: "+1 (555) 123-4567"
    }
  });

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState(false);
  const [revenueData, setRevenueData] = useState(MOCK_REVENUE_DATA);
  const [activeNow, setActiveNow] = useState(573);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [likedProducts, setLikedProducts] = useState<number[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string>("");

  // Generate or get session ID for guest users
  const getSessionId = (): string => {
    let session = localStorage.getItem("guest_session");
    if (!session) {
      session = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("guest_session", session);
    }
    return session;
  };

  // Load cart from database
  const loadCartFromDatabase = async (customerId: number) => {
    try {
      const dbCartItems = await cartApi.getCart(customerId);
      // Convert database format to CartItem format
      const cartItems: CartItem[] = dbCartItems.map((item: any) => ({
        productId: item.product_id,
        quantity: item.quantity,
        size: item.size || undefined,
        color: item.color || undefined,
      }));
      setCart(cartItems);
    } catch (error: any) {
      console.error("Error loading cart from database:", error);
      // Don't show error toast, just log it
    }
  };

  // Load guest cart from database
  const loadGuestCartFromDatabase = async (sessionId: string) => {
    try {
      const dbCartItems = await cartApi.getGuestCart(sessionId);
      // Convert database format to CartItem format
      const cartItems: CartItem[] = dbCartItems.map((item: any) => ({
        productId: item.product_id,
        quantity: item.quantity,
        size: item.size || undefined,
        color: item.color || undefined,
      }));
      setCart(cartItems);
    } catch (error: any) {
      console.error("Error loading guest cart from database:", error);
      // Don't show error toast, just log it
    }
  };

  // Load customer from localStorage on mount and load cart
  useEffect(() => {
    const savedCustomer = localStorage.getItem("customer");
    if (savedCustomer) {
      try {
        const customerData = JSON.parse(savedCustomer);
        setCustomer(customerData);
        setIsCustomerAuthenticated(true);
        // Load cart, liked products, and orders from database after customer is loaded
        loadCartFromDatabase(customerData.id);
        getLikedProducts();
        getCustomerOrders();
      } catch (e) {
        console.error("Error loading customer from localStorage:", e);
        localStorage.removeItem("customer");
        // Load guest cart instead
        const session = getSessionId();
        setSessionId(session);
        loadGuestCartFromDatabase(session);
      }
    } else {
      // No customer, load guest cart
      const session = getSessionId();
      setSessionId(session);
      loadGuestCartFromDatabase(session);
    }
  }, []);

  // Helper to normalize category names
  const normalizeCategory = (cat: string | undefined | null) => cat ? cat.trim() : "";

  // Load all data from API
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load products (convert price from decimal to cents)
      const productsData = await productsApi.getAll();
      const productsWithPriceInCents = productsData.map((p: any) => ({
        ...p,
        price: Math.round(parseFloat(p.price) * 100) // Convert decimal to cents
      }));
      setProducts(productsWithPriceInCents);

      // Load categories
      const categoriesData = await categoriesApi.getAll();
      setCategories(categoriesData);

      // Load slides
      const slidesData = await slidesApi.getAll();
      setSlides({
        special: slidesData.special || [],
        normal: slidesData.normal || []
      });

      // Load users
      const usersData = await usersApi.getAll();
      setUsers(usersData);

      // Load transactions (convert amount from decimal to number)
      const transactionsData = await transactionsApi.getAll();
      const transactionsWithAmount = transactionsData.map((t: any) => ({
        ...t,
        amount: parseFloat(t.amount)
      }));
      setTransactions(transactionsWithAmount);

      // Load settings
      try {
        const settingsData = await settingsApi.getAll();
        if (settingsData.storeName) {
          setSettings(prev => ({
            ...prev,
            storeName: settingsData.storeName || prev.storeName,
            maintenanceMode: settingsData.maintenanceMode === true || settingsData.maintenanceMode === "true",
            adminAvatar: settingsData.adminAvatar || prev.adminAvatar,
            invoice: {
              storeName: settingsData["invoice.storeName"] || prev.invoice.storeName,
              logo: settingsData["invoice.logo"] || prev.invoice.logo,
              taxPercentage: parseInt(settingsData["invoice.taxPercentage"] || String(prev.invoice.taxPercentage), 10),
              shippingCharge: parseInt(settingsData["invoice.shippingCharge"] || String(prev.invoice.shippingCharge), 10),
              footerText: settingsData["invoice.footerText"] || prev.invoice.footerText,
              address: settingsData["invoice.address"] || prev.invoice.address,
              email: settingsData["invoice.email"] || prev.invoice.email,
              phone: settingsData["invoice.phone"] || prev.invoice.phone,
            },
            notifications: {
              "New Order Received": settingsData["notifications.New Order Received"] !== false,
              "Product Low Stock Alert": settingsData["notifications.Product Low Stock Alert"] !== false,
              "New User Registration": settingsData["notifications.New User Registration"] !== false,
              "Refund Request": settingsData["notifications.Refund Request"] !== false,
              "Daily Summary Email": settingsData["notifications.Daily Summary Email"] !== false,
            }
          }));
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        // Use defaults if settings fail to load
      }

    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error Loading Data",
        description: error.message || "Failed to load data from database",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Simulate active users changing
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNow(prev => {
        const change = Math.floor(Math.random() * 10) - 5;
        return Math.max(0, prev + change);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Derived stats (dynamic!)
  const stats = {
    totalProducts: products.length,
    totalUsers: users.length,
    totalSales: transactions.reduce((sum, t) => t.status === "Completed" ? sum + t.amount : sum, 0),
    recentOrders: transactions.filter(t => new Date(t.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    salesGrowth: 20.1,
    usersGrowth: 12,
    activeGrowth: 201
  };

  // Admin authentication functions
  const adminLogin = async (email: string, password: string) => {
    try {
      const { authApi } = await import("./api");
      const response = await authApi.login(email, password);
      
      if (response.success && response.user) {
        setIsAuthenticated(true);
        setAdmin(response.user);
        localStorage.setItem("admin", JSON.stringify(response.user));
        localStorage.setItem("isAuthenticated", "true");
        return response;
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      throw error;
    }
  };

  // Actions
  const login = (user?: any) => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
    if (user) {
      setAdmin(user);
      localStorage.setItem("admin", JSON.stringify(user));
    }
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    setAdmin(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("admin");
  };

  // Customer authentication functions
  const customerLogin = async (email: string, password: string) => {
    try {
      const response = await customerApi.login(email, password);
      if (response.success && response.customer) {
        // Remove password from customer object before storing
        const { password: _, ...customerData } = response.customer;
        setCustomer(customerData);
        setIsCustomerAuthenticated(true);
        localStorage.setItem("customer", JSON.stringify(customerData));

        // Merge guest cart if exists
        const currentSessionId = sessionId || getSessionId();
        if (currentSessionId) {
          try {
            await cartApi.mergeGuestCart(currentSessionId, customerData.id);
            // Clear guest session
            localStorage.removeItem("guest_session");
            setSessionId("");
          } catch (mergeError) {
            console.error("Error merging guest cart:", mergeError);
            // Continue with login even if merge fails
          }
        }

        // Load cart, liked products, and orders from database after login
        await loadCartFromDatabase(customerData.id);
        await getLikedProducts();
        await getCustomerOrders();
        toast({
          title: "Login Successful",
          description: `Welcome back, ${customerData.name}!`,
        });
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    }
  };

  const customerRegister = async (email: string, password: string, name: string, phone?: string) => {
    try {
      const response = await customerApi.register(email, password, name, phone);
      if (response.success && response.customer) {
        // Remove password from customer object before storing
        const { password: _, ...customerData } = response.customer;
        setCustomer(customerData);
        setIsCustomerAuthenticated(true);
        localStorage.setItem("customer", JSON.stringify(customerData));
        // Load cart, liked products, and orders from database after registration (will be empty for new user)
        await loadCartFromDatabase(customerData.id);
        await getLikedProducts();
        await getCustomerOrders();
        toast({
          title: "Registration Successful",
          description: `Welcome, ${customerData.name}! Your account has been created.`,
        });
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const customerLogout = async () => {
    try {
      // Before logging out, convert customer cart to session cart
      if (customer?.id && cart.length > 0) {
        const currentSessionId = sessionId || getSessionId();
        if (!sessionId) setSessionId(currentSessionId);

        // Get current customer cart items from database
        const dbCartItems = await cartApi.getCart(customer.id);

        // Convert each item to session-based
        for (const item of dbCartItems) {
          try {
            await cartApi.addGuestItem({
              session_id: currentSessionId,
              product_id: item.product_id,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
            });
          } catch (error) {
            console.error("Error converting cart item to session:", error);
          }
        }

        // Clear the customer cart from database
        await cartApi.clearCart(customer.id);
      }

      // Clear local state
      setCustomer(null);
      setIsCustomerAuthenticated(false);
      setLikedProducts([]);
      setOrders([]);
      localStorage.removeItem("customer");

      // Load guest cart
      const currentSessionId = sessionId || getSessionId();
      await loadGuestCartFromDatabase(currentSessionId);

      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      console.error("Error during logout:", error);
      // Still perform logout even if cart conversion fails
      setCustomer(null);
      setIsCustomerAuthenticated(false);
      setCart([]);
      setLikedProducts([]);
      setOrders([]);
      localStorage.removeItem("customer");
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      // Convert price from cents to decimal for DB
      const productForDb = {
        ...product,
        price: product.price / 100
      };
      const newProduct = await productsApi.create(productForDb);
      // Convert price back to cents
      const productWithPriceInCents = {
        ...newProduct,
        price: Math.round(parseFloat(newProduct.price) * 100)
      };
      setProducts([...products, productWithPriceInCents]);
      
      // Ensure category exists
      const normalizedCategory = normalizeCategory(product.category);
      if (normalizedCategory && !categories.includes(normalizedCategory)) {
        try {
          await categoriesApi.create(normalizedCategory);
          setCategories([...categories, normalizedCategory]);
        } catch (err: any) {
          // Category might already exist, that's okay
          if (!err.message.includes("already exists")) {
            console.error("Error adding category:", err);
          }
        }
      }
      
      toast({ title: "Product Added", description: `${product.name} has been added to inventory.` });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    try {
      // Convert price if provided
      const updatesForDb: any = { ...updates };
      if (updates.price !== undefined) {
        updatesForDb.price = updates.price / 100;
      }
      
      const updatedProduct = await productsApi.update(id, updatesForDb);
      // Convert price back to cents
      const productWithPriceInCents = {
        ...updatedProduct,
        price: Math.round(parseFloat(updatedProduct.price) * 100)
      };
      setProducts(products.map(p => p.id === id ? productWithPriceInCents : p));
      
      // If category changed, ensure it exists
      if (updates.category) {
        const normalizedCategory = normalizeCategory(updates.category);
        if (normalizedCategory && !categories.includes(normalizedCategory)) {
          try {
            await categoriesApi.create(normalizedCategory);
            setCategories([...categories, normalizedCategory]);
          } catch (err: any) {
            if (!err.message.includes("already exists")) {
              console.error("Error adding category:", err);
            }
          }
        }
      }
      
      toast({ title: "Product Updated", description: "Changes saved successfully." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await productsApi.delete(id);
      setProducts(products.filter(p => p.id !== id));
      toast({ title: "Product Deleted", description: "Product removed from inventory.", variant: "destructive" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateUser = async (id: number, updates: Partial<User>) => {
    try {
      const updatedUser = await usersApi.update(id, updates);
      setUsers(users.map(u => u.id === id ? updatedUser : u));
      toast({ title: "User Updated", description: "User details updated." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive"
      });
      throw error;
    }
  };

  const toggleMaintenanceMode = async () => {
    try {
      const newValue = !settings.maintenanceMode;
      await settingsApi.update("maintenanceMode", newValue);
      setSettings(prev => ({ ...prev, maintenanceMode: newValue }));
      toast({ 
        title: `Maintenance Mode ${newValue ? 'Enabled' : 'Disabled'}`, 
        description: newValue ? "Store is now hidden from customers." : "Store is live again." 
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update maintenance mode",
        variant: "destructive"
      });
    }
  };

  const toggleNotification = async (key: string) => {
    try {
      const notifications = settings.notifications as Record<string, boolean>;
      const currentValue = notifications[key] || false;
      const newValue = !currentValue;
      await settingsApi.update(`notifications.${key}`, newValue);
      setSettings(prev => ({
        ...prev,
        notifications: { ...(prev.notifications as Record<string, boolean>), [key]: newValue }
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update notification",
        variant: "destructive"
      });
    }
  };

  const updateStoreName = async (name: string) => {
    try {
      await settingsApi.update("storeName", name);
      setSettings(prev => ({ ...prev, storeName: name }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update store name",
        variant: "destructive"
      });
    }
  };

  const updateAdminAvatar = async (avatar: string) => {
    try {
      await settingsApi.update("adminAvatar", avatar);
      setSettings(prev => ({ ...prev, adminAvatar: avatar }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update avatar",
        variant: "destructive"
      });
    }
  };

  const updateInvoiceSettings = async (updates: Partial<StoreState["settings"]["invoice"]>) => {
    try {
      for (const [key, value] of Object.entries(updates)) {
        await settingsApi.update(`invoice.${key}`, value);
      }
      setSettings(prev => ({
        ...prev,
        invoice: { ...prev.invoice, ...updates }
      }));
      toast({ title: "Settings Saved", description: "Invoice settings updated." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice settings",
        variant: "destructive"
      });
    }
  };

  const addCategory = async (category: string) => {
    try {
      const normalized = normalizeCategory(category);
      if (!normalized) return;
      
      await categoriesApi.create(normalized);
      setCategories([...categories, normalized]);
      toast({ title: "Category Added", description: `${normalized} has been added.` });
    } catch (error: any) {
      if (error.message.includes("already exists") || error.message.includes("409")) {
        toast({ title: "Category Exists", description: `${category} already exists.`, variant: "destructive" });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to add category",
          variant: "destructive"
        });
      }
    }
  };

  const updateCategory = async (oldCategory: string, newCategory: string) => {
    try {
      const oldNorm = normalizeCategory(oldCategory);
      const newNorm = normalizeCategory(newCategory);
      if (!newNorm || oldNorm === newNorm) return;
      
      await categoriesApi.update(oldNorm, newNorm);
      
      const next = categories.map(cat => normalizeCategory(cat) === oldNorm ? newNorm : cat);
      setCategories(next);
      
      // Update products with this category
      const updatedProducts = await productsApi.getAll();
      const productsWithPriceInCents = updatedProducts.map((p: any) => ({
        ...p,
        price: Math.round(parseFloat(p.price) * 100)
      }));
      setProducts(productsWithPriceInCents);
      
      toast({ title: "Category Updated", description: `${oldNorm} has been renamed to ${newNorm}.` });
    } catch (error: any) {
      if (error.message.includes("already exists") || error.message.includes("409")) {
        toast({ title: "Category Exists", description: `${newCategory} already exists.`, variant: "destructive" });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update category",
          variant: "destructive"
        });
      }
    }
  };

  const deleteCategory = async (category: string) => {
    try {
      const normalized = normalizeCategory(category);
      if (!normalized) return;

      const result = await categoriesApi.delete(normalized);
      const reassignedCount = (result as any).reassignedCount || 0;
      
      // Refresh categories and products
      const updatedCategories = await categoriesApi.getAll();
      setCategories(updatedCategories);
      
      const updatedProducts = await productsApi.getAll();
      const productsWithPriceInCents = updatedProducts.map((p: any) => ({
        ...p,
        price: Math.round(parseFloat(p.price) * 100)
      }));
      setProducts(productsWithPriceInCents);

      toast({ 
        title: "Category Deleted", 
        description: reassignedCount > 0 
          ? `${normalized} removed. ${reassignedCount} product(s) moved to "Uncategorized".`
          : `${normalized} has been removed.`,
        variant: "destructive" 
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  // Cart functions (persisted to DB)
  const addToCart = async (item: CartItem, requireAuth: boolean = false) => {
    // Check authentication if required
    if (requireAuth && !isCustomerAuthenticated) {
      throw new Error("AUTH_REQUIRED");
    }

    try {
      if (isCustomerAuthenticated && customer?.id) {
        // Authenticated user - save to customer cart
        await cartApi.addItem({
          customer_id: customer.id,
          product_id: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        });
      } else {
        // Guest user - save to session cart
        const currentSessionId = sessionId || getSessionId();
        if (!sessionId) setSessionId(currentSessionId);
        
        await cartApi.addGuestItem({
          session_id: currentSessionId,
          product_id: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        });
      }

      // Update local state
      setCart(prev => {
        const existing = prev.find(i => i.productId === item.productId && i.size === item.size && i.color === item.color);
        if (existing) {
          return prev.map(i => 
            i.productId === item.productId && i.size === item.size && i.color === item.color
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        }
        return [...prev, item];
      });

      const product = products.find(p => p.id === item.productId);
      toast({ title: "Added to Cart", description: `${product?.name || "Item"} has been added to your cart.` });
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add item to cart",
      });
      throw error;
    }
  };

  const removeFromCart = async (productId: number, size?: string, color?: string, giftPackId?: number) => {
    try {
      if (isCustomerAuthenticated && customer?.id) {
        // Authenticated user - remove from customer cart
        const dbCartItems = await cartApi.getCart(customer.id);
        const itemToRemove = dbCartItems.find((item: any) => 
          item.product_id === productId &&
          (item.size === size || (!item.size && !size)) &&
          (item.color === color || (!item.color && !color)) &&
          (item.gift_pack_id === giftPackId || (!item.gift_pack_id && !giftPackId))
        );

        if (itemToRemove) {
          await cartApi.removeItem(itemToRemove.id);
        }
      } else {
        // Guest user - remove from session cart
        const currentSessionId = sessionId || getSessionId();
        const dbCartItems = await cartApi.getGuestCart(currentSessionId);
        const itemToRemove = dbCartItems.find((item: any) => 
          item.product_id === productId &&
          (item.size === size || (!item.size && !size)) &&
          (item.color === color || (!item.color && !color)) &&
          (item.gift_pack_id === giftPackId || (!item.gift_pack_id && !giftPackId))
        );

        if (itemToRemove) {
          await cartApi.removeGuestItem(itemToRemove.id);
        }
      }

      // Update local state
      setCart(prev => prev.filter(item => 
        !(item.productId === productId && 
          (item.size === size || (!item.size && !size)) &&
          (item.color === color || (!item.color && !color)) &&
          (item.giftPackId === giftPackId || (!item.giftPackId && !giftPackId)))
      ));
      toast({ title: "Removed from Cart", description: "Item has been removed from your cart." });
    } catch (error: any) {
      console.error("Error removing from cart:", error);
      // Still update local state even if DB call fails
      setCart(prev => prev.filter(item => 
        !(item.productId === productId && 
          (item.size === size || (!item.size && !size)) &&
          (item.color === color || (!item.color && !color)) &&
          (item.giftPackId === giftPackId || (!item.giftPackId && !giftPackId)))
      ));
      toast({ title: "Removed from Cart", description: "Item has been removed from your cart." });
    }
  };

  const updateCartItemQuantity = async (productId: number, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      await removeFromCart(productId, size, color);
      return;
    }

    try {
      if (isCustomerAuthenticated && customer?.id) {
        // Authenticated user - update customer cart
        const dbCartItems = await cartApi.getCart(customer.id);
        const itemToUpdate = dbCartItems.find((item: any) => 
          item.product_id === productId &&
          (item.size === size || (!item.size && !size)) &&
          (item.color === color || (!item.color && !color))
        );

        if (itemToUpdate) {
          await cartApi.updateItem(itemToUpdate.id, quantity);
        }
      } else {
        // Guest user - update session cart
        const currentSessionId = sessionId || getSessionId();
        const dbCartItems = await cartApi.getGuestCart(currentSessionId);
        const itemToUpdate = dbCartItems.find((item: any) => 
          item.product_id === productId &&
          (item.size === size || (!item.size && !size)) &&
          (item.color === color || (!item.color && !color))
        );

        if (itemToUpdate) {
          await cartApi.updateGuestItem(itemToUpdate.id, quantity);
        }
      }

      // Update local state
      setCart(prev => prev.map(item => 
        item.productId === productId && 
        (item.size === size || (!item.size && !size)) &&
        (item.color === color || (!item.color && !color))
          ? { ...item, quantity }
          : item
      ));
    } catch (error: any) {
      console.error("Error updating cart:", error);
      // Still update local state even if DB call fails
      setCart(prev => prev.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = async () => {
    try {
      if (isCustomerAuthenticated && customer?.id) {
        await cartApi.clearCart(customer.id);
      } else {
        // For guest carts, just clear local state since session carts are temporary
        // In a real implementation, you might want to clear the session cart from DB too
      }
    } catch (error: any) {
      console.error("Error clearing cart:", error);
    }
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      const productPrice = product ? (product.price / 100) * item.quantity : 0;
      const giftPackPrice = item.giftPackPrice ? (item.giftPackPrice / 100) * item.quantity : 0;
      return total + productPrice + giftPackPrice;
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Liked Products (Wishlist) functions
  const toggleLikeProduct = async (productId: number) => {
    if (!customer?.id) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please login to add products to your wishlist.",
      });
      return;
    }

    try {
      const { likedProductsApi } = await import("./api");
      const response = await likedProductsApi.toggleLike(customer.id, productId);
      setLikedProducts(prev => {
        if (response.isLiked) {
          return prev.includes(productId) ? prev : [...prev, productId];
        } else {
          return prev.filter(id => id !== productId);
        }
      });
      toast({
        title: response.isLiked ? "Added to Wishlist" : "Removed from Wishlist",
        description: response.message,
      });
    } catch (error: any) {
      console.error("Error toggling liked product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update wishlist",
      });
    }
  };

  const getLikedProducts = async () => {
    if (!customer?.id) {
      setLikedProducts([]);
      return;
    }

    try {
      const { likedProductsApi } = await import("./api");
      const liked = await likedProductsApi.getLikedProducts(customer.id);
      setLikedProducts(liked.map((item: any) => item.product_id));
    } catch (error: any) {
      console.error("Error loading liked products:", error);
    }
  };

  // Customer Orders functions
  const getCustomerOrders = async () => {
    console.log("getCustomerOrders called, customer:", customer);
    if (!customer?.id) {
      console.log("No customer ID, clearing orders");
      setOrders([]);
      return;
    }

    try {
      console.log("Fetching orders for customer ID:", customer.id);
      const { customerOrdersApi } = await import("./api");
      const customerOrders = await customerOrdersApi.getCustomerOrders(customer.id);
      console.log("Received orders:", customerOrders);
      setOrders(customerOrders);
    } catch (error: any) {
      console.error("Error loading customer orders:", error);
    }
  };

  // Slide actions
  const addSlide = async (type: 'special' | 'normal', slide: Omit<Slide, "id">) => {
    try {
      const newSlide = await slidesApi.create({ ...slide, type });
      setSlides(prev => ({
        ...prev,
        [type]: [...prev[type], newSlide]
      }));
      toast({ title: "Slide Added", description: `${slide.title} has been added.` });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add slide",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateSlide = async (type: 'special' | 'normal', id: number, updates: Partial<Slide>) => {
    try {
      const updatedSlide = await slidesApi.update(id, type, updates);
      setSlides(prev => ({
        ...prev,
        [type]: prev[type].map(s => s.id === id ? updatedSlide : s)
      }));
      toast({ title: "Slide Updated", description: "Slide changes saved successfully." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update slide",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteSlide = async (type: 'special' | 'normal', id: number) => {
    try {
      await slidesApi.delete(id, type);
      setSlides(prev => ({
        ...prev,
        [type]: prev[type].filter(s => s.id !== id)
      }));
      toast({ title: "Slide Deleted", description: "Slide removed.", variant: "destructive" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete slide",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <StoreContext.Provider value={{
      products,
      users,
      transactions,
      revenueData,
      activeNow,
      stats,
      settings,
      categories,
      isAuthenticated,
      admin,
      isAdmin,
      customer,
      isCustomerAuthenticated,
      cart,
      slides,
      likedProducts,
      orders,
      isLoading,
      login,
      adminLogin,
      logout,
      customerLogin,
      customerRegister,
      customerLogout,
      addProduct,
      updateProduct,
      deleteProduct,
      updateUser,
      toggleMaintenanceMode,
      toggleNotification,
      updateStoreName,
      updateAdminAvatar,
      updateInvoiceSettings,
      addCategory,
      updateCategory,
      deleteCategory,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
      getCartTotal,
      getCartItemCount,
      addSlide,
      updateSlide,
      deleteSlide,
      refreshData,
      toggleLikeProduct,
      getLikedProducts,
      getCustomerOrders,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
