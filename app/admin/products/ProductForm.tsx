"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { createNewProduct, updateProduct } from "./actions";
import type { Product, Category } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [colors, setColors] = useState<{ name: string; hex: string }[]>(
    product?.colors || []
  );
  const [serverError, setServerError] = useState<any>(null);

  // Bind the server action with the product ID if editing
  const formAction =
    isEditing && product
      ? updateProduct.bind(null, product.id)
      : createNewProduct;

  return (
    <form
      action={async (formData: FormData) => {
        setServerError(null);

        // Add colors to form data
        formData.set("colors", JSON.stringify(colors));

        startTransition(async () => {
          const result = await formAction(formData);
          console.log("Server response:", result);

          if (!result.success) {
            setServerError(result.serverError);
            toast({
              variant: "destructive",
              description: result.error,
            });
            return;
          }

          router.push("/admin/products");
          router.refresh();
        });
      }}
      className="space-y-8"
    >
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>
            <pre className="whitespace-pre-wrap font-mono text-xs">
              {JSON.stringify(serverError, null, 2)}
            </pre>
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
                defaultValue={product?.name}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                name="category_id"
                defaultValue={product?.category_id}
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
                defaultValue={product?.price}
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
                defaultValue={product?.stock}
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
              defaultValue={product?.description}
              required
              disabled={isPending}
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label htmlFor="images">Images (URLs)</Label>
            <Input
              id="images"
              name="images"
              placeholder="Enter image URLs, separated by commas"
              defaultValue={product?.images?.join(", ")}
              disabled={isPending}
            />
            <p className="text-sm text-muted-foreground">
              Enter comma-separated image URLs
            </p>
          </div>

          {/* Colors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Colors</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setColors([...colors, { name: "", hex: "#000000" }])
                }
                disabled={isPending}
              >
                Add Color
              </Button>
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
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      setColors(colors.filter((_, i) => i !== index))
                    }
                    disabled={isPending}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              name="featured"
              defaultChecked={product?.featured}
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
