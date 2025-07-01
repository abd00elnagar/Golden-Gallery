"use client";

import type React from "react";
import { useState, useEffect, Suspense } from "react";
import { Plus, Edit, Trash2, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProductCount,
} from "@/lib/actions";
import type { Category } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Loading from "./loading";
import Link from "next/link";

function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);

        // Fetch product counts for each category
        const counts: Record<string, number> = {};
        await Promise.all(
          fetchedCategories.map(async (category) => {
            counts[category.id] = await getCategoryProductCount(category.id);
          })
        );
        setProductCounts(counts);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load categories. Please try again.",
        });
      }
    };

    loadCategories();
  }, [toast]);

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newCategory = await createCategory({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      if (!newCategory) {
        throw new Error("Failed to create category");
      }

      setCategories([...categories, newCategory]);
      setFormData({ name: "", description: "" });
      setIsAddDialogOpen(false);

      toast({
        title: "Category added",
        description: "The category has been successfully added.",
      });
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !editingCategory) {
      toast({
        title: "Validation Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedCategory = await updateCategory(editingCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      if (!updatedCategory) {
        throw new Error("Failed to update category");
      }

      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id ? updatedCategory : cat
        )
      );
      setFormData({ name: "", description: "" });
      setEditingCategory(null);

      toast({
        title: "Category updated",
        description: "The category has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const result = await deleteCategory(categoryId);

      if (!result.success) {
        toast({
          title: "Cannot delete category",
          description: result.error || "Failed to delete category",
          variant: "destructive",
        });
        return;
      }

      setCategories(categories.filter((c) => c.id !== categoryId));
      toast({
        title: "Category deleted",
        description: "The category has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
  };

  const closeEditDialog = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 w-full">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-4 mb-2">
              <Link href="/admin">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Categories Management</h1>
            </div>
            <p className="text-muted-foreground">
              Manage your product categories here
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6 w-full">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-primary focus:bg-background transition-colors w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Categories ({filteredCategories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="line-clamp-2">{category.description}</p>
                      </TableCell>
                      <TableCell>
                        {productCounts[category.id] || 0} products
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog
                            open={editingCategory?.id === category.id}
                            onOpenChange={(open) => !open && closeEditDialog()}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(category)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit category</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Category</DialogTitle>
                              </DialogHeader>
                              <form
                                onSubmit={handleEditCategory}
                                className="space-y-4"
                              >
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">
                                    Category Name *
                                  </Label>
                                  <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        name: e.target.value,
                                      })
                                    }
                                    placeholder="Enter category name"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-description">
                                    Description
                                  </Label>
                                  <Textarea
                                    id="edit-description"
                                    value={formData.description}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        description: e.target.value,
                                      })
                                    }
                                    placeholder="Enter category description"
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeEditDialog}
                                  >
                                    Cancel
                                  </Button>
                                  <Button type="submit">Update Category</Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete category</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Category
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this category?
                                  This action cannot be undone.
                                  {"\n"}
                                  If this category has any products, you will
                                  need to move or delete them first.
                                  {productCounts[category.id] > 0 && (
                                    <>
                                      <br />
                                      <br />
                                      <span className="font-medium text-destructive">
                                        Warning: This category has{" "}
                                        {productCounts[category.id]} product(s).
                                        You will need to move or delete these
                                        products first.
                                      </span>
                                    </>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteCategory(category.id)
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CategoriesContent />
    </Suspense>
  );
}
