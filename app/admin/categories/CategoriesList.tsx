"use client";
import { useState } from "react";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions";
import { Pencil, Trash2, Loader2, Plus } from "lucide-react";

interface CategoriesListProps {
  categories: Category[];
  productCounts: Record<string, number>;
}

export default function CategoriesList({ categories: initialCategories, productCounts: initialProductCounts }: CategoriesListProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [productCounts, setProductCounts] = useState(initialProductCounts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [pendingAdd, setPendingAdd] = useState(false);
  const [pendingEdit, setPendingEdit] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: "Validation Error", description: "Category name is required.", variant: "destructive" });
      return;
    }
    setPendingAdd(true);
    try {
      const newCategory = await createCategory({ name: formData.name.trim(), description: formData.description.trim() });
      if (!newCategory) throw new Error("Failed to create category");
      setCategories([...categories, newCategory]);
      setFormData({ name: "", description: "" });
      setIsAddDialogOpen(false);
      toast({ title: "Category added", description: "The category has been successfully added." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add category. Please try again.", variant: "destructive" });
    } finally {
      setPendingAdd(false);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingCategory) {
      toast({ title: "Validation Error", description: "Category name is required.", variant: "destructive" });
      return;
    }
    setPendingEdit(true);
    try {
      const updatedCategory = await updateCategory(editingCategory.id, { name: formData.name.trim(), description: formData.description.trim() });
      if (!updatedCategory) throw new Error("Failed to update category");
      setCategories(categories.map((cat) => (cat.id === editingCategory.id ? updatedCategory : cat)));
      setFormData({ name: "", description: "" });
      setEditingCategory(null);
      toast({ title: "Category updated", description: "The category has been successfully updated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update category. Please try again.", variant: "destructive" });
    } finally {
      setPendingEdit(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setPendingDeleteId(categoryId);
    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter((cat) => cat.id !== categoryId));
      toast({ title: "Category deleted", description: "The category has been deleted." });
    } catch (error) {
      toast({ title: "Cannot delete category", description: "Failed to delete category. Please try again.", variant: "destructive" });
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            Categories
          </CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)} className="ml-auto flex items-center gap-2" disabled={pendingAdd}>
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-6 w-full"
          />
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>{productCounts[category.id] || 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingCategory(category);
                          setFormData({ name: category.name, description: category.description || "" });
                        }} disabled={pendingEdit || pendingDeleteId === category.id} className="flex items-center gap-1">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" disabled={pendingDeleteId === category.id} className="flex items-center gap-1">
                              {pendingDeleteId === category.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4" />
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this category?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={pendingDeleteId === category.id}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCategory(category.id)} disabled={pendingDeleteId === category.id}>
                                {pendingDeleteId === category.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
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

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              required
              disabled={pendingAdd}
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              disabled={pendingAdd}
            />
            <Button type="submit" className="w-full flex items-center gap-2" disabled={pendingAdd}>
              {pendingAdd ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {pendingAdd ? "Adding..." : "Add"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => {
        if (!open) setEditingCategory(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCategory} className="space-y-4">
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              required
              disabled={pendingEdit}
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              disabled={pendingEdit}
            />
            <Button type="submit" className="w-full flex items-center gap-2" disabled={pendingEdit}>
              {pendingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {pendingEdit ? "Updating..." : "Update"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
