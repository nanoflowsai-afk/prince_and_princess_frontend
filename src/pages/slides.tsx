import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Trash2, Calendar, X, Image as ImageIcon, Edit, Pencil, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, type Slide } from "@/lib/store";

export default function Slides() {
  const { toast } = useToast();
  const { categories, slides, addSlide, updateSlide, deleteSlide, addCategory, updateCategory, deleteCategory, products } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("special");
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [newSlide, setNewSlide] = useState({ 
    title: "", 
    description: "", 
    image: "", 
    date: "",
    category: "",
    imageFile: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageInputType, setImageInputType] = useState<"url" | "upload">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Keep under ~2MB so base64 fits localStorage comfortably
      if (file.size > 2 * 1024 * 1024) {
        toast({ 
          title: "File too large", 
          description: "Please select an image smaller than 2MB (for reliable saving)", 
          variant: "destructive" 
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({ 
          title: "Invalid file type", 
          description: "Please select an image file", 
          variant: "destructive" 
        });
        return;
      }

      setNewSlide({ ...newSlide, imageFile: file, image: "" });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewSlide({ ...newSlide, imageFile: null, image: "" });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUrlChange = (url: string) => {
    setNewSlide({ ...newSlide, image: url, imageFile: null });
    setImagePreview(url || null);
  };

  const handleEditClick = (slide: Slide, type: 'special' | 'normal') => {
    setEditingSlide(slide);
    setActiveTab(type);
    setNewSlide({
      title: slide.title,
      description: slide.description || "",
      image: slide.image,
      date: slide.date || "",
      category: slide.category || "",
      imageFile: null
    });
    setImagePreview(slide.image);
    setImageInputType("url");
    setIsOpen(true);
  };

  const handleSaveSlide = () => {
    // if (!newSlide.title) {
    //   toast({ title: "Error", description: "Please enter a title", variant: "destructive" });
    //   return;
    // }

    // Determine image source
    let imageUrl = newSlide.image;
    if (newSlide.imageFile && imagePreview) {
      // Use preview URL for uploaded file (in production, you'd upload to server)
      imageUrl = imagePreview;
    }
    
    if (!imageUrl) {
      toast({ 
        title: "Error", 
        description: "Please upload an image or enter an image URL", 
        variant: "destructive" 
      });
      return;
    }

    const slideData = {
      id: editingSlide ? editingSlide.id : Date.now(),
      title: newSlide.title,
      description: newSlide.description || "",
      image: imageUrl,
      date: activeTab === "special" ? newSlide.date : null,
      category: newSlide.category || ""
    };

    if (editingSlide) {
      // Update existing slide
      updateSlide(activeTab as 'special' | 'normal', editingSlide.id, slideData);
    } else {
      // Add new slide
      addSlide(activeTab as 'special' | 'normal', slideData);
    }

    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingSlide(null);
    setNewSlide({ title: "", description: "", image: "", date: "", category: "", imageFile: null });
    setImagePreview(null);
    setImageInputType("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = (type: 'special' | 'normal', id: number) => {
    deleteSlide(type, id);
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Slides Manager</h1>
            <p className="text-muted-foreground mt-1">Manage your app's hero slides and banners</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Add New Slide
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSlide ? "Edit Slide" : `Add New Slide (${activeTab === "special" ? "Special Day" : "Normal Day"})`}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title </Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Summer Sale" 
                    value={newSlide.title}
                    onChange={(e) => setNewSlide({...newSlide, title: e.target.value})}
                    className="rounded-lg"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Enter slide description (optional)" 
                    value={newSlide.description}
                    onChange={(e) => setNewSlide({...newSlide, description: e.target.value})}
                    className="rounded-lg min-h-[80px]"
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newSlide.category || "none"} 
                    onValueChange={(value) => {
                      // Convert "none" back to empty string, otherwise use the value
                      setNewSlide({...newSlide, category: value === "none" ? "" : value});
                    }}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="image">Image *</Label>
                  
                  {/* Image Input Type Toggle */}
                  <div className="flex gap-2 mb-2">
                    <Button
                      type="button"
                      variant={imageInputType === "upload" ? "default" : "outline"}
                      size="sm"
                      className="rounded-lg"
                      onClick={() => {
                        setImageInputType("upload");
                        setNewSlide({ ...newSlide, image: "" });
                        setImagePreview(null);
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                    <Button
                      type="button"
                      variant={imageInputType === "url" ? "default" : "outline"}
                      size="sm"
                      className="rounded-lg"
                      onClick={() => {
                        setImageInputType("url");
                        setNewSlide({ ...newSlide, imageFile: null });
                        setImagePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Image URL
                    </Button>
                  </div>

                  {/* Upload Option */}
                  {imageInputType === "upload" && (
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Label
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                          </div>
                        </Label>
                      </div>
                      {imagePreview && (
                        <div className="relative">
                          <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full"
                            onClick={handleRemoveImage}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* URL Option */}
                  {imageInputType === "url" && (
                    <div className="space-y-2">
                  <Input 
                    id="image" 
                        placeholder="https://example.com/image.jpg" 
                    value={newSlide.image}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                    className="rounded-lg"
                  />
                      {newSlide.image && (
                        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                          <img 
                            src={newSlide.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            onError={() => {
                              toast({ 
                                title: "Invalid Image URL", 
                                description: "Please check the URL and try again", 
                                variant: "destructive" 
                              });
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full"
                            onClick={() => handleImageUrlChange("")}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {activeTab === "special" && (
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={newSlide.date}
                      onChange={(e) => setNewSlide({...newSlide, date: e.target.value})}
                      className="rounded-lg"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleDialogClose(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveSlide} className="rounded-xl">
                  {editingSlide ? "Update Slide" : "Publish Slide"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Management Section */}
        <Card className="border-2 border-dashed border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl">Category Management</CardTitle>
              </div>
              <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => {
                setIsCategoryDialogOpen(open);
                if (!open) setNewCategory("");
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Plus className="w-4 h-4 mr-2" /> Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="new-category">Category Name</Label>
                      <Input
                        id="new-category"
                        placeholder="e.g. Toys, Clothing"
                        className="rounded-lg"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newCategory.trim()) {
                            addCategory(newCategory.trim());
                            setIsCategoryDialogOpen(false);
                            setNewCategory("");
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCategoryDialogOpen(false);
                        setNewCategory("");
                      }}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (newCategory.trim()) {
                          addCategory(newCategory.trim());
                          setIsCategoryDialogOpen(false);
                          setNewCategory("");
                        }
                      }}
                      className="rounded-xl"
                    >
                      Add Category
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((category) => {
                  const productsInCategory = products.filter(p => p.category === category).length;
                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <span className="font-medium">{category}</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {productsInCategory} product{productsInCategory !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => {
                            setEditingCategory(category);
                            setEditCategoryName(category);
                            setIsEditCategoryDialogOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                          onClick={() => deleteCategory(category)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No categories yet. Add your first category to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Category Dialog */}
        <Dialog open={isEditCategoryDialogOpen} onOpenChange={(open) => {
          setIsEditCategoryDialogOpen(open);
          if (!open) {
            setEditingCategory(null);
            setEditCategoryName("");
          }
        }}>
          <DialogContent className="rounded-2xl sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category Name</Label>
                <Input
                  id="edit-category"
                  placeholder="e.g. Toys, Clothing"
                  className="rounded-lg"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editCategoryName.trim() && editingCategory) {
                      updateCategory(editingCategory, editCategoryName.trim());
                      setIsEditCategoryDialogOpen(false);
                      setEditingCategory(null);
                      setEditCategoryName("");
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditCategoryDialogOpen(false);
                  setEditingCategory(null);
                  setEditCategoryName("");
                }}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editCategoryName.trim() && editingCategory) {
                    updateCategory(editingCategory, editCategoryName.trim());
                    setIsEditCategoryDialogOpen(false);
                    setEditingCategory(null);
                    setEditCategoryName("");
                  }
                }}
                className="rounded-xl"
              >
                Update Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="special" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="special" className="rounded-lg">Special Days</TabsTrigger>
            <TabsTrigger value="normal" className="rounded-lg">Normal Days</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="special" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slides.special.map((slide) => (
                  <Card key={slide.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all group">
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button 
                          variant="default" 
                          size="icon" 
                          className="rounded-full"
                          onClick={() => handleEditClick(slide, 'special')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="rounded-full"
                          onClick={() => handleDelete('special', slide.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{slide.title}</h3>
                          {slide.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {slide.description}
                            </p>
                          )}
                          {slide.category && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                              {slide.category}
                            </span>
                          )}
                          <div className="flex items-center text-sm text-muted-foreground mt-2">
                            <Calendar className="w-3 h-3 mr-1" />
                            {slide.date}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="normal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slides.normal.map((slide) => (
                  <Card key={slide.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all group">
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button 
                          variant="default" 
                          size="icon" 
                          className="rounded-full"
                          onClick={() => handleEditClick(slide, 'normal')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="rounded-full"
                          onClick={() => handleDelete('normal', slide.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex-1">
                      <h3 className="font-bold text-lg">{slide.title}</h3>
                        {slide.description ? (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {slide.description}
                          </p>
                        ) : (
                      <p className="text-sm text-muted-foreground mt-1">Standard Display</p>
                        )}
                        {slide.category && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                            {slide.category}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
