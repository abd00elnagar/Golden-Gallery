"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
} from "@/components/ui/alert-dialog"
import { mockCategories, mockProducts } from "@/lib/mock-data"
import type { Category } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(mockCategories)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const { toast } = useToast()

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getCategoryProductCount = (categoryId: string) => {
    return mockProducts.filter((p) => p.category_id === categoryId).length
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required.",
        variant: "destructive",
      })
      return
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
    }

    setCategories([...categories, newCategory])
    setFormData({ name: "", description: "" })
    setIsAddDialogOpen(false)

    toast({
      title: "Category added",
      description: "The category has been successfully added.",
    })
  }

  const handleEditCategory = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !editingCategory) {
      toast({
        title: "Validation Error",
        description: "Category name is required.",
        variant: "destructive",
      })
      return
    }

    const updatedCategories = categories.map((cat) =>
      cat.id === editingCategory.id
        ? { ...cat, name: formData.name.trim(), description: formData.description.trim() }
        : cat,
    )

    setCategories(updatedCategories)
    setFormData({ name: "", description: "" })
    setEditingCategory(null)

    toast({
      title: "Category updated",
      description: "The category has been successfully updated.",
    })
  }

  const handleDeleteCategory = (categoryId: string) => {
    const productCount = getCategoryProductCount(categoryId)

    if (productCount > 0) {
      toast({
        title: "Cannot delete category",
        description: `This category has ${productCount} products. Please move or delete the products first.`,
        variant: "destructive",
      })
      return
    }

    setCategories(categories.filter((c) => c.id !== categoryId))
    toast({
      title: "Category deleted",
      description: "The category has been successfully deleted.",
    })
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
    })
  }

  const closeEditDialog = () => {
    setEditingCategory(null)
    setFormData({ name: "", description: "" })
  }

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Categories Management</h1>
          <p className="text-muted-foreground">Organize your products with categories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Category Name *</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-description">Description</Label>
                <Textarea
                  id="add-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Category</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-primary focus:bg-background transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
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
                {filteredCategories.map((category) => {
                  const productCount = getCategoryProductCount(category.id)
                  return (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="line-clamp-2">{category.description}</p>
                      </TableCell>
                      <TableCell>{productCount} products</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog
                            open={editingCategory?.id === category.id}
                            onOpenChange={(open) => !open && closeEditDialog()}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit category</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Category</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleEditCategory} className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Category Name *</Label>
                                  <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter category name"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-description">Description</Label>
                                  <Textarea
                                    id="edit-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter category description"
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button type="button" variant="outline" onClick={closeEditDialog}>
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
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{category.name}"?
                                  {productCount > 0 && (
                                    <span className="text-destructive font-medium">
                                      {" "}
                                      This category has {productCount} products and cannot be deleted.
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCategory(category.id)}
                                  disabled={productCount > 0}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
