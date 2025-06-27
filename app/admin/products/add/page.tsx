"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockCategories } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

interface ProductColor {
  id: string
  name: string
  hex: string
  image: string
}

export default function AddProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image_url: "",
  })
  const [colors, setColors] = useState<ProductColor[]>([])
  const [newColor, setNewColor] = useState({
    name: "",
    hex: "#000000",
    image: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.description || !formData.price || !formData.stock || !formData.category_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (colors.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one color variant.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Product added",
      description: "The product has been successfully added to your catalog.",
    })

    router.push("/admin/products")
  }

  const addColor = () => {
    if (!newColor.name) {
      toast({
        title: "Validation Error",
        description: "Please enter a color name.",
        variant: "destructive",
      })
      return
    }

    const color: ProductColor = {
      id: Date.now().toString(),
      ...newColor,
    }

    setColors([...colors, color])
    setNewColor({ name: "", hex: "#000000", image: "" })
  }

  const removeColor = (colorId: string) => {
    setColors(colors.filter((c) => c.id !== colorId))
  }

  const handleImageUpload = (type: "main" | "color", colorId?: string) => {
    toast({
      title: "Image upload",
      description: "Image upload functionality would be implemented here.",
    })
  }

  return (
    <div className="container py-8 max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product for your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Image */}
        <Card>
          <CardHeader>
            <CardTitle>Main Product Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Click to upload or drag and drop your main product image
              </p>
              <Button type="button" variant="outline" onClick={() => handleImageUpload("main")}>
                Choose File
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Color Management */}
        <Card>
          <CardHeader>
            <CardTitle>Color Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Color */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Add Color Variant</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color-name">Color Name</Label>
                  <Input
                    id="color-name"
                    value={newColor.name}
                    onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                    placeholder="e.g., Ocean Blue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color-hex">Color Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color-hex"
                      type="color"
                      value={newColor.hex}
                      onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={newColor.hex}
                      onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={addColor} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Color
                  </Button>
                </div>
              </div>
            </div>

            {/* Color List */}
            {colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Color Variants ({colors.length})</h3>
                <div className="grid gap-3">
                  {colors.map((color) => (
                    <div key={color.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-muted"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{color.name}</p>
                        <p className="text-sm text-muted-foreground">{color.hex}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleImageUpload("color", color.id)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeColor(color.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove color</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Add Product</Button>
        </div>
      </form>
    </div>
  )
}
