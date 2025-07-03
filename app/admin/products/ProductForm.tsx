"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { X, Plus, Image as ImageIcon } from "lucide-react";
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

  // Product images state - when editing, keep existing images as strings
  const [productImages, setProductImages] = useState<(File | string)[]>(
    product?.images || []
  );

  // Color state: { name, hex, image: File | string }
  const [colors, setColors] = useState<
    { name: string; hex: string; image?: File | string }[]
  >(
    (product?.colors as any[])?.map((c) => ({
      name: c.name,
      hex: c.hex,
      image: c.image,
    })) || []
  );

  // Featured state
  const [featured, setFeatured] = useState<boolean>(product?.featured ?? false);

  const [serverError, setServerError] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // File input refs - only used for new products
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const colorImageInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  // Handle color image selection - only for new products
  const handleColorImageChange = (idx: number, file: File) => {
    if (isEditing) return; // Disabled for editing

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Only image files are allowed.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      toast({
        title: "File Too Large",
        description: "Image must be smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setColors((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, image: file } : c))
    );
  };

  const removeColorImage = (idx: number) => {
    if (isEditing) return; // Disabled for editing

    setColors((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, image: undefined } : c))
    );
  };

  // Handle color add/remove - only for new products
  const addColor = () => {
    if (isEditing) return; // Disabled for editing
    setColors([...colors, { name: "", hex: "#000000" }]);
  };

  const removeColor = (idx: number) => {
    if (isEditing) return; // Disabled for editing
    setColors(colors.filter((_, i) => i !== idx));
    colorImageInputRefs.current.splice(idx, 1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

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
      if (colors.some((c) => !c.name || !c.hex)) {
        setFormError("Each color must have a name and hex value.");
        return;
      }
      if (colors.some((c) => !c.image)) {
        setFormError("Each color must have an image.");
        return;
      }
    } else {
      // For editing, only validate color names and hex values
      if (colors.some((c) => !c.name || !c.hex)) {
        setFormError("Each color must have a name and hex value.");
        return;
      }
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Add featured value to form data
    formData.set("featured", featured.toString());

    if (!isEditing) {
      // For new products, append product images and color images
      productImages.forEach((img) => {
        if (img instanceof File) formData.append("images", img);
      });
      colors.forEach((c, i) => {
        if (c.image instanceof File)
          formData.append(`colorImage_${i}`, c.image);
      });
    } else {
      // For editing, preserve existing images
      formData.set("preserveImages", "true");
      formData.set("existingProductImages", JSON.stringify(productImages));
      formData.set(
        "existingColorImages",
        JSON.stringify(colors.map((c) => c.image))
      );
    }

    // Append colors data
    formData.set(
      "colors",
      JSON.stringify(colors.map(({ name, hex }) => ({ name, hex })))
    );

    // If editing, add productId
    if (isEditing && product?.id) {
      formData.set("productId", product.id);
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  // Prefill test data for add mode
  const testDefaults = !isEditing
    ? {
        name: "Test Product",
        description: "This is a test product description.",
        price: 99.99,
        stock: 10,
        category_id: categories[0]?.id || "",
        featured: true,
      }
    : {};

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error display */}
      {(formError || serverError || state.error) && (
        <Alert variant="destructive">
          <AlertDescription>
            <pre className="whitespace-pre-wrap font-mono text-xs">
              {formError || serverError || state.error}
            </pre>
          </AlertDescription>
        </Alert>
      )}

      {/* Info message for editing mode */}
      {isEditing && (
        <Alert>
          <AlertDescription>
            <strong>Edit Mode:</strong> You can only modify product information,
            color names, and hex values. Images cannot be changed in edit mode.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Product" : "Add New Product"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name || testDefaults.name}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                name="category_id"
                defaultValue={product?.category_id || testDefaults.category_id}
                required
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
              <Label htmlFor="price">Price</Label>
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
              <Label htmlFor="stock">Stock</Label>
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description || testDefaults.description}
              required
              disabled={isPending}
            />
          </div>

          {/* Product Images */}
          <div className="space-y-2">
            <Label>Product Images {isEditing && "(Read-only)"}</Label>
            <div className="flex gap-2 flex-wrap">
              {productImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-24 h-24 rounded overflow-hidden border bg-muted"
                >
                  <Image
                    src={img instanceof File ? URL.createObjectURL(img) : img}
                    alt={`Product Preview ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                    priority={idx === 0}
                    onError={(e) => {
                      console.error("Image load error:", e);
                      toast({
                        title: "Image Error",
                        description:
                          "Failed to load image. Please try another.",
                        variant: "destructive",
                      });
                    }}
                  />
                  {!isEditing && (
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-1 hover:bg-red-700 z-10"
                      onClick={() => removeProductImage(idx)}
                      aria-label={`Remove image ${idx + 1}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {!isEditing && productImages.length < 4 && (
                <button
                  type="button"
                  className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed rounded hover:bg-accent/30 transition"
                  onClick={() => productImageInputRef.current?.click()}
                  aria-label="Add product image"
                >
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <span className="text-xs mt-1">Add Image</span>
                </button>
              )}
              {!isEditing && (
                <input
                  ref={productImageInputRef}
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleProductImageChange}
                  aria-label="Product images"
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {isEditing
                ? "Images cannot be modified in edit mode."
                : "Upload up to 4 images. At least 1 required. Maximum size: 5MB per image."}
            </p>
          </div>

          {/* Colors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Colors {isEditing && "(Names and colors only)"}</Label>
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addColor}
                  disabled={isPending}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Color
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {colors.map((color, index) => (
                <div key={index} className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Color Name</Label>
                    <Input
                      value={color.name}
                      onChange={(e) =>
                        setColors(
                          colors.map((c, i) =>
                            i === index ? { ...c, name: e.target.value } : c
                          )
                        )
                      }
                      disabled={isPending}
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Color Hex</Label>
                    <Input
                      type="color"
                      value={color.hex}
                      onChange={(e) =>
                        setColors(
                          colors.map((c, i) =>
                            i === index ? { ...c, hex: e.target.value } : c
                          )
                        )
                      }
                      disabled={isPending}
                      required
                    />
                  </div>

                  {/* Color image display/upload */}
                  <div className="flex flex-col items-center gap-1">
                    <Label>Image {isEditing && "(Read-only)"}</Label>
                    <div className="relative w-16 h-16 rounded overflow-hidden border bg-muted">
                      {color.image ? (
                        <>
                          <Image
                            src={
                              color.image instanceof File
                                ? URL.createObjectURL(color.image)
                                : color.image
                            }
                            alt={`Color Preview - ${color.name}`}
                            fill
                            className="object-cover"
                            sizes="64px"
                            onError={(e) => {
                              console.error("Color image load error:", e);
                              toast({
                                title: "Image Error",
                                description:
                                  "Failed to load color image. Please try another.",
                                variant: "destructive",
                              });
                            }}
                          />
                          {!isEditing && (
                            <button
                              type="button"
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-1 hover:bg-red-700 z-10"
                              onClick={() => removeColorImage(index)}
                              aria-label={`Remove ${color.name} color image`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        !isEditing && (
                          <button
                            type="button"
                            className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed rounded hover:bg-accent/30 transition"
                            onClick={() =>
                              colorImageInputRefs.current[index]?.click()
                            }
                            aria-label={`Add image for ${color.name} color`}
                          >
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            <span className="text-xs mt-1">Add</span>
                          </button>
                        )
                      )}
                      {!isEditing && (
                        <input
                          ref={(el) => {
                            colorImageInputRefs.current[index] = el;
                          }}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleColorImageChange(index, file);
                          }}
                          aria-label={`Color image for ${color.name}`}
                        />
                      )}
                    </div>
                  </div>

                  {!isEditing && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeColor(index)}
                      disabled={isPending}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
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
            <Label htmlFor="featured">Featured Product</Label>
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
  );
}
