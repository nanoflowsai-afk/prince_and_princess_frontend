import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Tag, Trash2, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const MOCK_OFFERS = [
  { id: 1, code: "SUMMER20", discount: "20%", description: "Summer collection discount", expiry: "2024-06-30", status: "Active" },
  { id: 2, code: "WELCOME10", discount: "10%", description: "New user welcome bonus", expiry: "2024-12-31", status: "Active" },
  { id: 3, code: "TOYFEST", discount: "15%", description: "Flat discount on all toys", expiry: "2023-12-25", status: "Expired" },
];

export default function Offers() {
  const { toast } = useToast();
  const [offers, setOffers] = useState(MOCK_OFFERS);
  const [isOpen, setIsOpen] = useState(false);
  const [newOffer, setNewOffer] = useState({ code: "", discount: "", description: "", expiry: "" });

  const handleAddOffer = () => {
    if (!newOffer.code || !newOffer.discount) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }

    const offer = {
      id: Date.now(),
      ...newOffer,
      status: "Active"
    };

    setOffers([...offers, offer]);
    setIsOpen(false);
    setNewOffer({ code: "", discount: "", description: "", expiry: "" });
    toast({ title: "Offer Created", description: "New discount code is live." });
  };

  const deleteOffer = (id: number) => {
    setOffers(offers.filter(o => o.id !== id));
    toast({ title: "Offer Deleted", description: "Discount code removed." });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Offers & Coupons</h1>
            <p className="text-muted-foreground mt-1">Manage discount codes and special offers</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Create Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Offer</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="code">Code</Label>
                    <Input 
                      id="code" 
                      placeholder="SALE50" 
                      className="uppercase"
                      value={newOffer.code}
                      onChange={(e) => setNewOffer({...newOffer, code: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="discount">Discount</Label>
                    <Input 
                      id="discount" 
                      placeholder="50%" 
                      value={newOffer.discount}
                      onChange={(e) => setNewOffer({...newOffer, discount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    placeholder="Summer sale discount..." 
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input 
                    id="expiry" 
                    type="date" 
                    value={newOffer.expiry}
                    onChange={(e) => setNewOffer({...newOffer, expiry: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddOffer} className="rounded-xl">Create Offer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="border-none shadow-lg hover:shadow-xl transition-all relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rotate-45 ${offer.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-bold text-lg px-3 py-1 rounded-lg">
                    {offer.code}
                  </Badge>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={() => deleteOffer(offer.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-3xl font-bold text-primary mt-2">{offer.discount} OFF</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-medium">{offer.description}</p>
                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Expires: {offer.expiry}</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${offer.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-sm font-medium">{offer.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}