import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Lock, Mail, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";
import { useTheme } from "next-themes";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useStore();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState("admin@prince.com");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !email.includes("@")) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }
    
    if (!password || password.length < 3) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: "Please enter your password.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { authApi } = await import("@/lib/api");
      console.log("🔐 [ADMIN LOGIN PAGE] Attempting admin login with:", email);
      console.log("📡 [ADMIN LOGIN PAGE] API Base URL:", import.meta.env.VITE_API_BASE_URL || "/api");
      console.log("📡 [ADMIN LOGIN PAGE] Will call: /api/auth/login (NOT /api/customer/login)");
      console.log("📡 [ADMIN LOGIN PAGE] This queries 'users' table (NOT 'customers' table)");
      
      const response = await authApi.login(email.trim(), password);
      console.log("✅ [ADMIN LOGIN PAGE] Login response received:", response);

      if (response && response.success && response.user) {
        console.log("✅ Login successful, setting authentication state...");
        // Use the login function from store to persist authentication
        login();
        console.log("✅ Authentication state set, redirecting...");
        toast({
          title: "✅ Login Successful!",
          description: `Welcome back, ${response.user.name || response.user.email}! Redirecting to dashboard...`,
        });
        setTimeout(() => {
          setLocation("/");
          console.log("✅ Redirected to dashboard");
        }, 800);
      } else {
        console.error("❌ Login failed - invalid response:", response);
        throw new Error(response?.message || "Login failed - invalid response");
      }
    } catch (error: any) {
      console.error("❌ Login error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      let errorMessage = "Login failed. Please try again.";
      
      if (error.message) {
        if (error.message.includes("Invalid credentials") || error.message.includes("401")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes("Access denied") || error.message.includes("403")) {
          errorMessage = "Access denied. You must have admin role to login.";
        } else if (error.message.includes("Network error") || error.message.includes("connect") || error.message.includes("fetch")) {
          errorMessage = "Cannot connect to server. Please make sure the server is running on port 3000.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: "❌ Login Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-slate-900 dark:text-slate-100" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-900 dark:text-slate-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <div className="w-full max-w-md">
        <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-colors">
          <CardHeader className="space-y-1 pb-6">
            <div className="text-center mb-6">
              <div className="h-16 w-16 bg-primary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Lock className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Admin Portal</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Sign in to access your dashboard
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                ⚠️ Admin Login - Uses 'users' table (NOT customers table)
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="dark:text-slate-200">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-primary dark:text-slate-100"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="dark:text-slate-200">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-primary pr-10 dark:text-slate-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="remember-me" 
                      checked={rememberMe}
                      onCheckedChange={setRememberMe}
                    />
                    <Label htmlFor="remember-me" className="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer">Remember me</Label>
                  </div>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-10 rounded-md font-medium transition-all"
                  disabled={isLoading}
                >
                {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account? <a href="#" className="text-primary font-medium hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}
