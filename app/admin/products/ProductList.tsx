"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteProduct, searchProducts } from "./actions";
import type { Product, Category } from "@/lib/types";
import { ProductForm } from "./ProductForm";

export function ProductList({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Effect to handle filtering whenever search query or category changes
  useEffect(() => {
    let result = [...products];

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (product) => product.category_id === selectedCategory
      );
    }

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          (product.description?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory]);

  const handleDeleteProduct = async (productId: string) => {
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        const updatedProducts = products.filter((p) => p.id !== productId);
        setProducts(updatedProducts);
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
      }
    });
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { label: "Out of Stock", variant: "destructive" as const };
    if (stock < 5) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  return (
    <div className="space-y-8">
      <div className="min-h-screen flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Products Management</h1>
              <p className="text-muted-foreground">
                Manage your product catalog
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/products/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-primary focus:bg-background transition-colors"
                  />
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Products ({filteredProducts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Colors</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product.stock);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                <Image
                                  src={
                                    product.images?.[0] || "/placeholder.svg"
                                  }
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {product.description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getCategoryName(product?.category_id || "")}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${product.price}
                          </TableCell>
                          <TableCell className="text-center">
                            {product.stock}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={stockStatus.variant}
                              className="w-full text-center inline-flex items-center justify-center whitespace-nowrap"
                            >
                              {stockStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 justify-center">
                              {product.colors
                                .slice(0, 3)
                                .map((color, index) => (
                                  <div
                                    key={`${product.id}-color-${index}`}
                                    className="w-6 h-6 rounded-full border-2 border-muted"
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                  />
                                ))}
                              {product.colors.length > 3 && (
                                <div
                                  key={`${product.id}-color-more`}
                                  className="w-6 h-6 rounded-full border-2 border-muted bg-muted flex items-center justify-center text-xs"
                                >
                                  +{product.colors.length - 3}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/product/${product.id}`}>
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View product</span>
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" asChild>
                                <Link
                                  href={`/admin/products/edit/${product.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit product</span>
                                </Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">
                                      Delete product
                                    </span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Product
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "
                                      {product.name}"? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteProduct(product.id)
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <ProductForm categories={categories} />
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <ProductForm
              product={editingProduct}
              isEditing
              categories={categories}
            />
          </div>
        </div>
      )}
    </div>
  );
}
