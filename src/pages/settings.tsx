import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";

// SVG data URIs for avatars (no external requests needed)
const boyAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%233b82f6'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='white' text-anchor='middle' dominant-baseline='middle' font-family='Arial, sans-serif' font-weight='bold'%3EBoy%3C/text%3E%3C/svg%3E";
const girlAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23ec4899'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='white' text-anchor='middle' dominant-baseline='middle' font-family='Arial, sans-serif' font-weight='bold'%3EGirl%3C/text%3E%3C/svg%3E";

export default function Settings() {
  const { toast } = useToast();
  const { settings, toggleMaintenanceMode, toggleNotification, updateStoreName, updateAdminAvatar, updateInvoiceSettings } = useStore();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your changes have been successfully saved.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage store configuration and preferences</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-[550px] rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">General</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">Notifications</TabsTrigger>
            <TabsTrigger value="invoice" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">Invoice</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="general">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                  <CardDescription>Update your store's general details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input 
                      id="storeName" 
                      value={settings.storeName} 
                      onChange={(e) => updateStoreName(e.target.value)}
                      className="rounded-xl" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input id="contactEmail" defaultValue="support@princeandprincess.com" className="rounded-xl" />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Disable store access for customers</p>
                    </div>
                    <Switch 
                      checked={settings.maintenanceMode}
                      onCheckedChange={toggleMaintenanceMode}
                    />
                  </div>
                  <Button onClick={handleSave} className="rounded-xl">Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Admin Profile</CardTitle>
                  <CardDescription>Manage your personal information and avatar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <Label>Profile Picture</Label>
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                        <AvatarImage src={settings.adminAvatar} />
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">Select avatar style:</span>
                        <div className="flex gap-3">
                          <div 
                            className={`cursor-pointer p-1 rounded-full border-2 transition-all ${settings.adminAvatar === boyAvatar ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:bg-muted'}`}
                            onClick={() => updateAdminAvatar(boyAvatar)}
                            title="Select Boy Avatar"
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={boyAvatar} />
                              <AvatarFallback>Boy</AvatarFallback>
                            </Avatar>
                          </div>
                          <div 
                            className={`cursor-pointer p-1 rounded-full border-2 transition-all ${settings.adminAvatar === girlAvatar ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:bg-muted'}`}
                            onClick={() => updateAdminAvatar(girlAvatar)}
                            title="Select Girl Avatar"
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={girlAvatar} />
                              <AvatarFallback>Girl</AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" defaultValue="Admin User" className="rounded-xl" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue="admin@princeandprincess.com" className="rounded-xl" />
                  </div>
                  <Button onClick={handleSave} className="rounded-xl">Update Profile</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Choose what you want to be notified about.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(settings.notifications).map(([item, checked]) => (
                    <div key={item} className="flex items-center justify-between rounded-xl border border-border p-4">
                      <Label className="text-base cursor-pointer flex-1">{item}</Label>
                      <Switch 
                        checked={checked}
                        onCheckedChange={() => toggleNotification(item)}
                      />
                    </div>
                  ))}
                  <Button onClick={handleSave} className="rounded-xl mt-4">Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoice">
              <Card className="border-none shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Invoice Settings</CardTitle>
                    <CardDescription>Preview and manage your invoice details.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Invoice Preview Card */}
                  <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="bg-primary/5 p-6 border-b flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-primary tracking-tight">INVOICE</h3>
                        <p className="text-muted-foreground font-medium text-sm">#INV-001</p>
                      </div>
                      <div className="text-right">
                        <h3 className="font-bold text-lg">{settings.invoice.storeName || "Store Name"}</h3>
                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                          <p>{settings.invoice.address || "Store Address"}</p>
                          <p>Phone: {settings.invoice.phone || "+1 (555) 000-0000"}</p>
                          <p>Email: {settings.invoice.email || "email@example.com"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-white">
                      <div className="text-center text-sm text-muted-foreground italic border-t pt-4 mt-4">
                        "{settings.invoice.footerText || "Thank you for your business!"}"
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">Edit Details</h3>
                    <div className="grid gap-2">
                      <Input 
                        id="businessName" 
                        value={settings.invoice.storeName} 
                        onChange={(e) => updateInvoiceSettings({ storeName: e.target.value })}
                        className="rounded-xl" 
                        placeholder="Business Name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Input 
                        id="logo" 
                        value={settings.invoice.logo} 
                        onChange={(e) => updateInvoiceSettings({ logo: e.target.value })}
                        className="rounded-xl" 
                        placeholder="Logo URL"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Input 
                          id="tax" 
                          type="number"
                          value={settings.invoice.taxPercentage} 
                          onChange={(e) => updateInvoiceSettings({ taxPercentage: Number(e.target.value) })}
                          className="rounded-xl" 
                          placeholder="Tax Percentage (%)"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Input 
                          id="shipping" 
                          type="number"
                          value={settings.invoice.shippingCharge} 
                          onChange={(e) => updateInvoiceSettings({ shippingCharge: Number(e.target.value) })}
                          className="rounded-xl" 
                          placeholder="Shipping Charge ($)"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Input 
                        id="email" 
                        value={settings.invoice.email} 
                        onChange={(e) => updateInvoiceSettings({ email: e.target.value })}
                        className="rounded-xl" 
                        placeholder="Support Email"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Input 
                        id="phone" 
                        value={settings.invoice.phone} 
                        onChange={(e) => updateInvoiceSettings({ phone: e.target.value })}
                        className="rounded-xl" 
                        placeholder="Phone Number"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Input 
                        id="address" 
                        value={settings.invoice.address} 
                        onChange={(e) => updateInvoiceSettings({ address: e.target.value })}
                        className="rounded-xl" 
                        placeholder="Business Address"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Input 
                        id="footer" 
                        value={settings.invoice.footerText} 
                        onChange={(e) => updateInvoiceSettings({ footerText: e.target.value })}
                        className="rounded-xl" 
                        placeholder="Footer Text"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
