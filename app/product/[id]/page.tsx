"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { mockProducts, mockCategories } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = mockProducts.find((p) => p.id === params.id)
  const category = mockCategories.find((c) => c.id === product?.category_id)
  const [selectedColorId, setSelectedColorId] = useState(product?.colors[0]?.id)
  const [isFavorite, setIsFavorite] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { toast } = useToast()

  if (!product) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const selectedColor = product.colors.find((c) => c.id === selectedColorId) || product.colors[0]

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? "Product removed from your favorites" : "Product added to your favorites",
    })
  }

  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${quantity} item(s) added to your cart`,
    })
  }

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <Link href={`/?category=${category?.id}`} className="text-sm text-muted-foreground hover:text-primary">
          {category?.name}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg border">
            <Image
              src={selectedColor?.image || product.images?.[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Color Images */}
          {product.colors.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.id}
                  className={`aspect-square relative overflow-hidden rounded border-2 ${
                    selectedColorId === color.id ? "border-primary" : "border-muted"
                  }`}
                  onClick={() => setSelectedColorId(color.id)}
                >
                  <Image
                    src={color.image || "/placeholder.svg"}
                    alt={`${product.name} - ${color.name}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{category?.name}</Badge>
              {product.stock < 5 && product.stock > 0 && <Badge variant="destructive">Only {product.stock} left</Badge>}
              {product.stock === 0 && <Badge variant="secondary">Out of stock</Badge>}
            </div>

            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold">${product.price}</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                {product.likes} likes
                <span>•</span>
                <ShoppingCart className="h-4 w-4" />
                {product.ordered} sold
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          <Separator />

          {/* Color Selection */}
          {product.colors.length > 1 && (
            <div>
              <h3 className="font-semibold mb-3">Color: {selectedColor?.name}</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.id}
                    className={`w-10 h-10 rounded-full border-2 ${
                      selectedColorId === color.id ? "border-primary" : "border-muted"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => setSelectedColorId(color.id)}
                    aria-label={`Select ${color.name} color`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="font-semibold mb-3">Quantity</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                +
              </Button>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full" size="lg" disabled={product.stock === 0} onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>

            <Button variant="outline" className="w-full bg-transparent" size="lg" onClick={handleToggleFavorite}>
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
          </div>

          {/* Product Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock:</span>
                  <span>{product.stock} available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{category?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Added:</span>
                  <span>{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
