import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { homepageHighlightsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, Image as ImageIcon, Pencil, Trash2, X } from "lucide-react";

type Highlight = {
  id: number;
  title: string;
  subtitle?: string | null;
  icon_type: "icon" | "image";
  icon_value?: string | null;
  image_url?: string | null;
  is_active: number;
  display_order?: number | null;
};

const ICON_OPTIONS = [
  "Truck",
  "Shield",
  "Smile",
  "Heart",
  "Star",
  "Gift",
  "ShoppingCart",
];

export default function HighlightsPage() {
  const { toast } = useToast();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);
  const [imageInputType, setImageInputType] = useState<"url" | "upload">("url");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    icon_value: "",
    image_url: "",
    is_active: 1,
    display_order: "" as string | number,
  });

  const loadHighlights = async () => {
    try {
      const data = await homepageHighlightsApi.getAll();
      setHighlights(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Failed to load highlights:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load highlights",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadHighlights();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      icon_value: "",
      image_url: "",
      is_active: 1,
      display_order: "",
    });
    setEditingHighlight(null);
    setImagePreview(null);
    setImageInputType("url");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (highlight: Highlight) => {
    setEditingHighlight(highlight);
    setForm({
      title: highlight.title,
      subtitle: highlight.subtitle || "",
      icon_value: highlight.icon_value || "",
      image_url: highlight.image_url || "",
      is_active: highlight.is_active ?? 1,
      display_order:
        highlight.display_order !== null && highlight.display_order !== undefined
          ? highlight.display_order
          : "",
    });
    setImagePreview(highlight.icon_type === "image" ? highlight.image_url || null : null);
    setImageInputType(
      highlight.icon_type === "image" && highlight.image_url && !highlight.image_url.startsWith("http")
        ? "upload"
        : "url"
    );
    setIsDialogOpen(true);
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
      setForm((prev) => ({ ...prev, image_url: result }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setForm((prev) => ({ ...prev, image_url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the highlight",
        variant: "destructive",
      });
      return;
    }

    // Normalize payload
    const hasImage = !!(form.image_url && form.image_url.trim() !== "");
    const payload: any = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      icon_type: hasImage ? "image" : "icon",
      icon_value: form.icon_value || null,
      image_url: hasImage ? form.image_url.trim() : null,
      is_active: form.is_active ? 1 : 0,
      display_order:
        form.display_order === "" || form.display_order === null
          ? null
          : Number(form.display_order),
    };

    try {
      if (editingHighlight) {
        await homepageHighlightsApi.update(editingHighlight.id, payload);
        toast({ title: "Highlight updated" });
      } else {
        await homepageHighlightsApi.create(payload);
        toast({ title: "Highlight created" });
      }
      setIsDialogOpen(false);
      resetForm();
      await loadHighlights();
    } catch (error: any) {
      console.error("Failed to save highlight:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save highlight",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this highlight?")) return;
    try {
      await homepageHighlightsApi.delete(id);
      toast({ title: "Highlight deleted" });
      await loadHighlights();
    } catch (error: any) {
      console.error("Failed to delete highlight:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete highlight",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Homepage Highlights</h1>
            <p className="text-muted-foreground mt-1">
              Manage the feature cards shown on the shop homepage (Free Shipping, Secure Payments, etc.)
            </p>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Add Highlight
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {editingHighlight ? "Edit Highlight" : "Add New Highlight"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    className="col-span-3 rounded-lg"
                    placeholder="Free Shipping"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subtitle" className="text-right">
                    Subtitle
                  </Label>
                  <Textarea
                    id="subtitle"
                    className="col-span-3 rounded-lg min-h-[60px]"
                    placeholder="On orders over ₹500"
                    value={form.subtitle}
                    onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Icon</Label>
                  <Select
                    value={form.icon_value || ""}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        icon_value: value,
                      }))
                    }
                  >
                    <SelectTrigger className="col-span-3 rounded-lg">
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Optional image (URL or upload) */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Image (optional)</Label>
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
                              setForm((prev) => ({ ...prev, image_url: "" }));
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      </div>

                      {imageInputType === "url" && (
                        <Input
                          placeholder="https://example.com/icon.png"
                          className="rounded-lg"
                          value={form.image_url}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, image_url: e.target.value }))
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

                      {(imagePreview || form.image_url) && (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                          <img
                            src={imagePreview || form.image_url}
                            alt="Highlight"
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
                  <Label className="text-right">Display Order</Label>
                  <Input
                    type="number"
                    className="col-span-3 rounded-lg"
                    placeholder="1"
                    value={form.display_order ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        display_order: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Active</Label>
                  <Select
                    value={form.is_active ? "1" : "0"}
                    onValueChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        is_active: val === "1" ? 1 : 0,
                      }))
                    }
                  >
                    <SelectTrigger className="col-span-3 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button className="rounded-xl" onClick={handleSave}>
                  {editingHighlight ? "Update Highlight" : "Save Highlight"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="font-display text-xl">Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            {highlights.length === 0 ? (
              <p className="text-muted-foreground text-sm">No highlights yet. Add your first one.</p>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subtitle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {highlights.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell>{h.display_order ?? "-"}</TableCell>
                      <TableCell>
                        {h.icon_type === "image" && h.image_url ? (
                          <img
                            src={h.image_url}
                            alt={h.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg border border-dashed flex items-center justify-center text-xs text-muted-foreground">
                            {h.icon_value || "Icon"}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{h.title}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {h.subtitle}
                      </TableCell>
                      <TableCell className="capitalize text-sm">{h.icon_type}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            h.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {h.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-pink-50 hover:text-pink-600"
                            onClick={() => openEditDialog(h)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDelete(h.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}


