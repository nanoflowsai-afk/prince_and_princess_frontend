import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Pencil, Trash2, Search, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { useRef } from "react";
import { formatRupees } from "@/lib/currency";

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageInputType, setImageInputType] = useState<"url" | "upload">("url");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hoverImageInputType, setHoverImageInputType] = useState<"url" | "upload">("url");
  const [hoverImagePreview, setHoverImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hoverFileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    size: "",
    color: "",
    description: "",
    type: "",
    gender: "",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=100&h=100",
    hover_image: ""
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const parsedSizes = formData.size
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const kidsSizePreset = [
    "16 (6 to 11M)",
    "18 (1 to 2 Yrs)",
    "20 (2 to 3 Yrs)",
    "22 (3 to 4 Yrs)",
    "24 (4 to 5 Yrs)",
    "26 (5 to 6 Yrs)",
    "28 (6 to 7 Yrs)",
    "30 (7 to 8 Yrs)"
  ];

  const toggleSizeChip = (size: string) => {
    if (parsedSizes.includes(size)) {
      const next = parsedSizes.filter(s => s !== size);
      setFormData({ ...formData, size: next.join(", ") });
    } else {
      const next = [...parsedSizes, size];
      setFormData({ ...formData, size: next.join(", ") });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload under 2MB", variant: "destructive" });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image: "" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload under 2MB", variant: "destructive" });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setHoverImagePreview(reader.result as string);
        setFormData({ ...formData, hover_image: "" });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearHoverImage = () => {
    setHoverImagePreview(null);
    setFormData({ ...formData, hover_image: "" });
    if (hoverFileInputRef.current) hoverFileInputRef.current.value = "";
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || !formData.quantity || !formData.category) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    // Resolve image value (upload preview overrides URL)
    const imageValue = imagePreview || formData.image;
    if (!imageValue) {
      toast({ title: "Error", description: "Please provide an image (upload or URL)", variant: "destructive" });
      return;
    }

    // Resolve hover image value (optional)
    const hoverImageValue = hoverImagePreview || formData.hover_image || null;

    // Convert price from Rupees to cents (user enters 799, we store as 79900 cents)
    const priceInCents = Math.round(parseFloat(formData.price) * 100);

    if (editingId) {
      updateProduct(editingId, {
        name: formData.name,
        category: formData.category,
        price: priceInCents,
        quantity: parseInt(formData.quantity),
        size: formData.size,
        color: formData.color,
        description: formData.description,
        type: formData.type,
        gender: formData.gender,
        image: imageValue,
        hover_image: hoverImageValue
      });
    } else {
      addProduct({
        name: formData.name,
        category: formData.category,
        price: priceInCents,
        quantity: parseInt(formData.quantity),
        size: formData.size,
        color: formData.color,
        description: formData.description,
        type: formData.type,
        gender: formData.gender,
        image: imageValue,
        hover_image: hoverImageValue
      });
    }
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "", category: "", price: "", quantity: "", size: "", color: "", description: "", type: "", gender: "", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=100&h=100", hover_image: "" });
    setEditingId(null);
    setImagePreview(null);
    setHoverImagePreview(null);
    setImageInputType("url");
    setHoverImageInputType("url");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (hoverFileInputRef.current) hoverFileInputRef.current.value = "";
  };

  const handleEditClick = (product: typeof products[0]) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: (product.price / 100).toString(), // Convert from cents to Rupees for display
      quantity: product.quantity.toString(),
      size: product.size || "",
      color: product.color || "",
      description: product.description || "",
      type: product.type || "",
      gender: product.gender || "",
      image: product.image,
      hover_image: product.hover_image || ""
    });
    setImagePreview(product.image.startsWith("http") ? null : product.image);
    setImageInputType(product.image.startsWith("http") ? "url" : "upload");
    setHoverImagePreview(product.hover_image && !product.hover_image.startsWith("http") ? product.hover_image : null);
    setHoverImageInputType(product.hover_image && product.hover_image.startsWith("http") ? "url" : "upload");
    setEditingId(product.id);
    setIsOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">Manage your store inventory</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-xl sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Teddy Bear" 
                    className="col-span-3 rounded-lg"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                    <SelectTrigger className="col-span-3 rounded-lg">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Price (₹)</Label>
                  <div className="col-span-3 space-y-1">
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="799" 
                      step="0.01"
                      min="0"
                      className="rounded-lg"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter price in Indian Rupees (e.g., 799 for ₹799.00)
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantity</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    placeholder="100" 
                    className="col-span-3 rounded-lg"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="size" className="text-right">Size</Label>
                  <div className="col-span-3 space-y-2">
                  <Input 
                    id="size" 
                      placeholder="e.g. XS, S, M, L, XL"
                      className="rounded-lg"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                  />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated sizes (e.g. XS, S, M, L, XL)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-md text-xs"
                        onClick={() => setFormData({...formData, size: kidsSizePreset.join(", ")})}
                      >
                        Use kids size preset
                      </Button>
                    </div>
                    {parsedSizes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {parsedSizes.map(size => (
                          <span
                            key={size}
                            className="px-2 py-1 rounded-md text-xs bg-primary/10 text-primary"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color" className="text-right">Color</Label>
                  <Input 
                    id="color" 
                    placeholder="Red, Blue" 
                    className="col-span-3 rounded-lg"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Type</Label>
                  <Input 
                    id="type" 
                    placeholder="Material Type" 
                    className="col-span-3 rounded-lg"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="gender" className="text-right">Gender</Label>
                  <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
                    <SelectTrigger className="col-span-3 rounded-lg">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baby">Baby</SelectItem>
                      <SelectItem value="Boy">Boy</SelectItem>
                      <SelectItem value="Girl">Girl</SelectItem>
                      <SelectItem value="Unisex">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Input 
                    id="description" 
                    placeholder="Product Description" 
                    className="col-span-3 rounded-lg"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">Image</Label>
                  <div className="col-span-3 space-y-3">
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
                          setFormData({ ...formData, image: "" });
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>

                    {imageInputType === "url" && (
                      <div className="space-y-2">
                        <Input
                          id="image"
                          placeholder="https://example.com/image.jpg"
                          className="rounded-lg"
                          value={formData.image}
                          onChange={(e) => setFormData({...formData, image: e.target.value})}
                        />
                      </div>
                    )}

                    {imageInputType === "upload" && (
                      <div className="space-y-2">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="rounded-lg"
                          onChange={handleImageUpload}
                        />
                      </div>
                    )}

                    {(imagePreview || formData.image) && (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                        <img
                          src={imagePreview || formData.image}
                          alt="Preview"
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hover_image" className="text-right">Hover Image (Optional)</Label>
                  <div className="col-span-3 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Image shown on hover - dress alone (hanging, laid out, or on mannequin) with clean background
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={hoverImageInputType === "url" ? "default" : "outline"}
                        className="rounded-lg"
                        onClick={() => {
                          setHoverImageInputType("url");
                          setHoverImagePreview(null);
                          if (hoverFileInputRef.current) hoverFileInputRef.current.value = "";
                        }}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Use URL
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={hoverImageInputType === "upload" ? "default" : "outline"}
                        className="rounded-lg"
                        onClick={() => {
                          setHoverImageInputType("upload");
                          setHoverImagePreview(null);
                          setFormData({ ...formData, hover_image: "" });
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>

                    {hoverImageInputType === "url" && (
                      <div className="space-y-2">
                        <Input
                          id="hover_image"
                          placeholder="https://example.com/hover-image.jpg"
                          className="rounded-lg"
                          value={formData.hover_image}
                          onChange={(e) => setFormData({...formData, hover_image: e.target.value})}
                        />
                      </div>
                    )}

                    {hoverImageInputType === "upload" && (
                      <div className="space-y-2">
                        <Input
                          ref={hoverFileInputRef}
                          type="file"
                          accept="image/*"
                          className="rounded-lg"
                          onChange={handleHoverImageUpload}
                        />
                      </div>
                    )}

                    {(hoverImagePreview || formData.hover_image) && (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                        <img
                          src={hoverImagePreview || formData.hover_image}
                          alt="Hover Preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 rounded-full"
                          onClick={clearHoverImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveProduct} className="rounded-xl">{editingId ? 'Update Product' : 'Save Product'}</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCategoryOpen} onOpenChange={(open) => {
            setIsCategoryOpen(open);
            if (!open) setNewCategory("");
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Add New Category</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-category" className="text-right">Name</Label>
                  <Input 
                    id="new-category" 
                    placeholder="e.g. Shoes" 
                    className="col-span-3 rounded-lg"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => {
                  if (newCategory.trim()) {
                    addCategory(newCategory.trim());
                    setIsCategoryOpen(false);
                    setNewCategory("");
                  }
                }} className="rounded-xl">Add Category</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Category Dialog */}
          <Dialog open={isEditCategoryOpen} onOpenChange={(open) => {
            setIsEditCategoryOpen(open);
            if (!open) {
              setEditingCategory(null);
              setEditCategoryName("");
            }
          }}>
            <DialogContent className="rounded-2xl sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Edit Category</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">Name</Label>
                  <Input 
                    id="edit-category" 
                    placeholder="e.g. Shoes" 
                    className="col-span-3 rounded-lg"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditCategoryOpen(false);
                    setEditingCategory(null);
                    setEditCategoryName("");
                  }}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button onClick={() => {
                  if (editingCategory && editCategoryName.trim() && editCategoryName.trim() !== editingCategory) {
                    updateCategory(editingCategory, editCategoryName.trim());
                    setIsEditCategoryOpen(false);
                    setEditingCategory(null);
                    setEditCategoryName("");
                  }
                }} className="rounded-xl">Update Category</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-background p-2 rounded-xl shadow-sm border border-border max-w-md">
          <Search className="w-4 h-4 text-muted-foreground ml-2" />
          <Input 
            placeholder="Search products..." 
            className="border-none shadow-none focus-visible:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Image</Label>
            <Input placeholder="Enter product image" className="bg-background rounded-xl border-border/50 focus:border-primary" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-background rounded-xl border-border/50 focus:border-primary">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Gender</Label>
            <Select>
              <SelectTrigger className="bg-background rounded-xl border-border/50 focus:border-primary">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background rounded-xl border-border/50 hover:bg-background/80",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="rounded-xl border border-border shadow-lg"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Category Management Section */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold">Category Management</h2>
            <Button 
              onClick={() => setIsCategoryOpen(true)}
              variant="outline" 
              size="sm"
              className="rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <div
                key={category}
                className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border"
              >
                <span className="text-sm font-medium">{category}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-primary/10"
                  onClick={() => {
                    setEditingCategory(category);
                    setEditCategoryName(category);
                    setIsEditCategoryOpen(true);
                  }}
                  title="Edit category"
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${category}"? Products with this category will be moved to "Uncategorized".`)) {
                      deleteCategory(category);
                    }
                  }}
                  title="Delete category"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead className="min-w-[120px]">Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="max-w-[150px] truncate">Description</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-10 h-10 rounded-lg object-cover shadow-sm" 
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <span className="px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.size || "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.color || "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.type || "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate" title={product.description ?? ""}>{product.description || "-"}</TableCell>
                  <TableCell className="font-bold text-muted-foreground">{formatRupees(product.price)}</TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-2 ${product.quantity < 10 ? 'text-red-500 font-bold' : 'text-foreground'}`}>
                      {product.quantity}
                      {product.quantity < 10 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg hover:bg-pink-50 hover:text-pink-600"
                        onClick={() => handleEditClick(product)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
