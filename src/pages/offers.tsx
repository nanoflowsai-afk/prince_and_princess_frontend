import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Tag, Trash2, Upload, Image as ImageIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { offersApi } from "@/lib/api";

export default function Offers() {
  const { toast } = useToast();
  const [offers, setOffers] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [newOffer, setNewOffer] = useState({ title: "", description: "", image_url: "", is_active: true });
  const [imageInputType, setImageInputType] = useState<"url" | "upload">("url");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const data = await offersApi.getAll();
        setOffers(Array.isArray(data) ? data : []);
      } catch (error: any) {
        console.error("Failed to load offers:", error);
        toast({ title: "Error", description: error.message || "Failed to load offers", variant: "destructive" });
      }
    };
    loadOffers();
  }, [toast]);

  const handleAddOffer = () => {
    setEditingOffer(null);
    setNewOffer({ title: "", description: "", image_url: "", is_active: true });
    setImagePreview(null);
    setImageInputType("url");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsOpen(true);
  };

  const handleSaveOffer = async () => {
    if (!newOffer.title) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    const payload = {
      title: newOffer.title,
      description: newOffer.description || null,
      image_url: newOffer.image_url || null,
      is_active: newOffer.is_active ? 1 : 0,
    };

    try {
      if (editingOffer) {
        const updated = await offersApi.update(editingOffer.id, payload);
        setOffers(offers.map((o) => (o.id === editingOffer.id ? updated : o)));
        toast({ title: "Offer Updated", description: "Offer has been updated." });
      } else {
        const created = await offersApi.create(payload);
        setOffers([created, ...offers]);
        toast({ title: "Offer Created", description: "New offer is live." });
      }
      setIsOpen(false);
      setEditingOffer(null);
      setNewOffer({ title: "", description: "", image_url: "", is_active: true });
      setImagePreview(null);
      setImageInputType("url");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      console.error("Failed to save offer:", error);
      toast({ title: "Error", description: error.message || "Failed to save offer", variant: "destructive" });
    }
  };

  const startEditOffer = (offer: any) => {
    setEditingOffer(offer);
    setNewOffer({
      title: offer.title,
      description: offer.description || "",
      image_url: offer.image_url || "",
      is_active: !!offer.is_active,
    });
    setImagePreview(offer.image_url || null);
    setImageInputType("url");
    setIsOpen(true);
  };

  const deleteOffer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      await offersApi.delete(id);
      setOffers(offers.filter((o) => o.id !== id));
      toast({ title: "Offer Deleted", description: "Offer removed." });
    } catch (error: any) {
      console.error("Failed to delete offer:", error);
      toast({ title: "Error", description: error.message || "Failed to delete offer", variant: "destructive" });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image under 2MB",
        variant: "destructive",
      });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setNewOffer((prev) => ({ ...prev, image_url: result }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setNewOffer((prev) => ({ ...prev, image_url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Offers & Coupons</h1>
            <p className="text-muted-foreground mt-1">Manage special offers displayed on the homepage banner</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingOffer(null);
              setNewOffer({ title: "", description: "", image_url: "", is_active: true });
              setImagePreview(null);
              setImageInputType("url");
              if (fileInputRef.current) fileInputRef.current.value = "";
            }
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> {editingOffer ? "Edit Offer" : "Create Offer"}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingOffer ? "Edit Offer" : "Create New Offer"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Big Summer Sale" 
                    value={newOffer.title}
                    onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    placeholder="Limited time offer on all night wear..." 
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image_url">Image URL (optional)</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={imageInputType === "url" ? "default" : "outline"}
                        className="rounded-lg"
                        onClick={() => {
                          setImageInputType("url");
                          setImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Use URL
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={imageInputType === "upload" ? "default" : "outline"}
                        className="rounded-lg"
                        onClick={() => {
                          setImageInputType("upload");
                          setImagePreview(null);
                          setNewOffer((prev) => ({ ...prev, image_url: "" }));
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>

                    {imageInputType === "url" && (
                      <Input
                        id="image_url"
                        placeholder="https://example.com/offer-banner.jpg"
                        value={newOffer.image_url}
                        onChange={(e) =>
                          setNewOffer((prev) => ({ ...prev, image_url: e.target.value }))
                        }
                      />
                    )}

                    {imageInputType === "upload" && (
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="rounded-lg"
                        onChange={handleImageUpload}
                      />
                    )}

                    {(imagePreview || newOffer.image_url) && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                        <img
                          src={imagePreview || newOffer.image_url}
                          alt="Offer"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 rounded-full"
                          onClick={clearImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveOffer} className="rounded-xl">
                  {editingOffer ? "Update Offer" : "Create Offer"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="border-none shadow-lg hover:shadow-xl transition-all relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rotate-45 ${offer.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-bold text-lg px-3 py-1 rounded-lg">
                    {offer.title}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => startEditOffer(offer)}
                    >
                      <Tag className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={() => deleteOffer(offer.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-primary mt-2">Special Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-medium">{offer.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${offer.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-sm font-medium">{offer.is_active ? "Active" : "Inactive"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}