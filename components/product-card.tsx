"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  isFavorite?: boolean
  onToggleFavorite?: (productId: string) => void
  onAddToCart?: (productId: string, colorId: string) => void
}

export function ProductCard({ product, isFavorite = false, onToggleFavorite, onAddToCart }: ProductCardProps) {
  const [selectedColorId, setSelectedColorId] = useState(product.colors[0]?.id)

  const selectedColor = product.colors.find((c) => c.id === selectedColorId) || product.colors[0]
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock < 5 && product.stock > 0

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite?.(product.id)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (selectedColor && !isOutOfStock) {
      onAddToCart?.(product.id, selectedColor.id)
    }
  }

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg">
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={selectedColor?.image || product.image_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
            onClick={handleToggleFavorite}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            <span className="sr-only">Toggle favorite</span>
          </Button>

          {/* Stock Badge */}
          {isOutOfStock && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Out of Stock
            </Badge>
          )}
          {isLowStock && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              Only {product.stock} left
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold">${product.price}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3 w-3" />
              {product.likes}
            </div>
          </div>
        </Link>

        {/* Color Selection - Always reserve space */}
        <div className="mb-4 h-8 flex items-center">
          {product.colors.length > 1 ? (
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.id}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColorId === color.id ? "border-primary scale-110" : "border-muted"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedColorId(color.id)
                  }}
                  aria-label={`Select ${color.name} color`}
                />
              ))}
            </div>
          ) : (
            // Empty placeholder to maintain consistent layout
            <div className="w-6 h-6" />
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" disabled={isOutOfStock} onClick={handleAddToCart}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  )
}
