"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createOrUpdateProductWithImages } from "./actions";
import type { Product, Category } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Plus, Image as ImageIcon, GripVertical } from "lucide-react";
import { useActionState } from "react";

interface ProductFormProps {
  product?: Product;
  isEditing?: boolean;
  categories: Category[];
}

export function ProductForm({
  product,
  isEditing = false,
  categories,
}: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Product images state with drag and drop reordering
  const [productImages, setProductImages] = useState<(File | string)[]>(
    product?.images || []
  );
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // Features and what's in the box lists
  const [features, setFeatures] = useState<string[]>(product?.features || []);
  const [whatsInTheBox, setWhatsInTheBox] = useState<string[]>(
    product?.whats_in_the_box || []
  );

  // Description markdown state
  const [description, setDescription] = useState<string>(
    product?.description || ""
  );

  // Color state: { name, hex }
  const [colors, setColors] = useState<{ name: string; hex: string }[]>(
    product?.colors || []
  );

  // Featured state
  const [featured, setFeatured] = useState<boolean>(product?.featured ?? false);

  const [serverError, setServerError] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // File input ref - only used for new products
  const productImageInputRef = useRef<HTMLInputElement>(null);

  // Handle image reordering
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggingIndex === null) return;

    const newImages = [...productImages];
    const draggedImage = newImages[draggingIndex];
    newImages.splice(draggingIndex, 1);
    newImages.splice(index, 0, draggedImage);
    setProductImages(newImages);
    setDraggingIndex(index);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  // Handle features and what's in the box
  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addBoxItem = () => {
    setWhatsInTheBox([...whatsInTheBox, ""]);
  };

  const removeBoxItem = (index: number) => {
    setWhatsInTheBox(whatsInTheBox.filter((_, i) => i !== index));
  };

  const updateBoxItem = (index: number, value: string) => {
    const newItems = [...whatsInTheBox];
    newItems[index] = value;
    setWhatsInTheBox(newItems);
  };

  // Handle color management
  const addColor = () => {
    setColors([...colors, { name: "", hex: "#000000" }]);
  };

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const updateColor = (index: number, field: "name" | "hex", value: string) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setColors(newColors);
  };

  // Handle product image selection - only for new products
  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditing) return; // Disabled for editing

    const files = Array.from(e.target.files || []);

    // Validate file types
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidFiles.length > 0) {
      setFormError("Only image files are allowed.");
      e.target.value = ""; // Clear input
      return;
    }

    // Validate file sizes (max 5MB each)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter((file) => file.size > MAX_SIZE);
    if (oversizedFiles.length > 0) {
      setFormError("Images must be smaller than 5MB each.");
      e.target.value = ""; // Clear input
      return;
    }

    // Check total number of images after adding new ones
    if (productImages.length + files.length > 4) {
      setFormError(
        `Maximum 4 images allowed. You currently have ${productImages.length} and are trying to add ${files.length} more.`
      );
      e.target.value = ""; // Clear input
      return;
    }

    // Clear any previous errors
    setFormError(null);

    // Add new images
    setProductImages((prev) => [...prev, ...files]);

    // Clear the input value to allow uploading the same file again
    e.target.value = "";
  };

  const removeProductImage = (idx: number) => {
    if (isEditing) return; // Disabled for editing

    setProductImages((prev) => {
      const newImages = [...prev];
      newImages.splice(idx, 1); // Remove the image at index
      return newImages;
    });

    setFormError(null); // Clear any errors since we're removing an image
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setServerError(null);

    // Client-side validation
    if (!isEditing) {
      // Only validate images for new products
      if (productImages.length < 1) {
        setFormError("At least one product image is required.");
        return;
      }
      if (productImages.length > 4) {
        setFormError("A maximum of 4 product images is allowed.");
        return;
      }
    }

    // Validate colors
    if (colors.some((c) => !c.name || !c.hex)) {
      setFormError("Each color must have a name and hex value.");
      return;
    }

    // Validate features and what's in the box if any items exist
    if (features.length > 0 && features.some((f) => !f.trim())) {
      setFormError("All features must have a value.");
      return;
    }

    if (
      whatsInTheBox.length > 0 &&
      whatsInTheBox.some((item) => !item.trim())
    ) {
      setFormError("All 'What's in the Box' items must have a value.");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Add featured value to form data
    formData.set("featured", featured.toString());

    if (!isEditing) {
      // For new products, append product images
      productImages.forEach((img) => {
        if (img instanceof File) formData.append("images", img);
      });
    } else {
      // For editing, preserve existing images
      formData.set("preserveImages", "true");
      formData.set("existingProductImages", JSON.stringify(productImages));
    }

    // Append colors data
    formData.set("colors", JSON.stringify(colors));

    // Append features and what's in the box
    formData.set("features", JSON.stringify(features));
    formData.set("whatsInTheBox", JSON.stringify(whatsInTheBox));

    // If editing, add productId
    if (isEditing && product?.id) {
      formData.set("productId", product.id);
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  const testDefaults = !isEditing
    ? {
        name: "Test Product",
        description: "This is a test home supplies product description.",
        price: 99.99,
        stock: 10,
        category_id: categories[0]?.id || "",
        featured: true,
      }
    : {};

  // useActionState for server validation
  const initialState = {
    success: false,
    error: "",
    product: undefined,
    redirect: undefined,
  };
  const [state, formAction] = useActionState(
    createOrUpdateProductWithImages,
    initialState
  );

  // Handle redirect on success
  useEffect(() => {
    if (state.success && state.redirect) {
      router.push(state.redirect);
    }
  }, [state, router]);

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-4xl">
        {/* Error display */}
        {(formError || serverError || state.error) && (
          <Alert variant="destructive">
            <AlertDescription>
              <pre className="whitespace-pre-wrap font-mono text-xs text-left">
                {formError || serverError || state.error}
              </pre>
            </AlertDescription>
          </Alert>
        )}

        {/* Info message for editing mode */}
        {isEditing && (
          <Alert>
            <AlertDescription className="text-left">
              <strong>Edit Mode:</strong> You can only modify product
              information, color names, and hex values. Images cannot be changed
              in edit mode.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-left">
              {isEditing ? "Edit Product" : "Add New Product"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-left">
                  Product Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={product?.name || testDefaults.name}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-left">
                  Category
                </Label>
                <Select
                  name="category_id"
                  defaultValue={
                    product?.category_id || testDefaults.category_id
                  }
                  required
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-left">
                  Price
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product?.price || testDefaults.price}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-left">
                  Stock
                </Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={product?.stock ?? testDefaults.stock}
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Description with Markdown Support */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-left">
                Description (Markdown Supported)
              </Label>
              <div data-color-mode="light">
                <MDEditor
                  value={description}
                  onChange={(val) => setDescription(val || "")}
                  preview="edit"
                  height={200}
                />
                <input type="hidden" name="description" value={description} />
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-2">
              <Label className="text-left">
                Key Features{" "}
                {features.length > 0 && <span className="text-red-500">*</span>}
              </Label>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Enter a feature"
                      required={features.length > 0}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFeature}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
              <input
                type="hidden"
                name="features"
                value={JSON.stringify(features)}
              />
            </div>

            {/* What's in the Box List */}
            <div className="space-y-2">
              <Label className="text-left">
                What's in the Box{" "}
                {whatsInTheBox.length > 0 && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              <div className="space-y-2">
                {whatsInTheBox.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateBoxItem(index, e.target.value)}
                      placeholder="Enter an item"
                      required={whatsInTheBox.length > 0}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeBoxItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addBoxItem}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              <input
                type="hidden"
                name="whatsInTheBox"
                value={JSON.stringify(whatsInTheBox)}
              />
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <Label className="text-left">Colors</Label>
              <div className="space-y-2">
                {colors.map((color, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={color.name}
                      onChange={(e) =>
                        updateColor(index, "name", e.target.value)
                      }
                      placeholder="Color name"
                      className="flex-1"
                    />
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) =>
                        updateColor(index, "hex", e.target.value)
                      }
                      className="h-10 w-20 px-1 rounded border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeColor(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addColor}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Color
                </Button>
              </div>
              <input
                type="hidden"
                name="colors"
                value={JSON.stringify(colors)}
              />
            </div>

            {/* Product Images with Drag and Drop */}
            <div className="space-y-2">
              <Label className="text-left">
                Product Images {isEditing && "(Read-only)"}
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {productImages.map((image, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group border rounded-lg p-2 cursor-move ${
                      draggingIndex === index ? "opacity-50" : ""
                    }`}
                  >
                    {!isEditing && (
                      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeProductImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-4 w-4 text-gray-500" />
                    </div>
                    <Image
                      src={
                        image instanceof File
                          ? URL.createObjectURL(image)
                          : image
                      }
                      alt={`Product image ${index + 1}`}
                      width={200}
                      height={200}
                      className="rounded object-cover w-full aspect-square"
                    />
                  </div>
                ))}
                {!isEditing && productImages.length < 4 && (
                  <div
                    className="border-2 border-dashed rounded-lg p-4 flex items-center justify-center cursor-pointer"
                    onClick={() => productImageInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <span className="mt-2 block text-sm text-gray-600">
                        Add Images (Max 4)
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        Select multiple at once
                      </span>
                    </div>
                    <input
                      ref={productImageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleProductImageChange}
                      className="hidden"
                      aria-label="Upload product images"
                    />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Images must be less than 5MB each. You can add up to 4 images.
              </p>
            </div>

            {/* Featured Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                name="featured"
                checked={featured}
                onCheckedChange={setFeatured}
                disabled={isPending}
              />
              <Label htmlFor="featured" className="text-left">
                Featured Product
              </Label>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Product"
                : "Create Product"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
