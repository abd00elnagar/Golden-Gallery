"use client"

import { useState, useMemo } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { mockProducts, mockCategories, mockUser } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [favorites, setFavorites] = useState(mockUser.favorites)
  const { toast } = useToast()

  const itemsPerPage = 12

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProducts, currentPage])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]

      toast({
        title: prev.includes(productId) ? "Removed from favorites" : "Added to favorites",
        description: prev.includes(productId)
          ? "Product removed from your favorites"
          : "Product added to your favorites",
      })

      return newFavorites
    })
  }

  const handleAddToCart = (productId: string, colorId: string) => {
    toast({
      title: "Added to cart",
      description: "Product has been added to your cart",
    })
  }

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Discover Beautiful Artwork</h1>
        <p className="text-muted-foreground text-lg">
          Explore our curated collection of paintings, sculptures, photography, and digital art.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-primary focus:bg-background transition-colors shadow-sm"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48 bg-background/50 border-muted-foreground/20 focus:border-primary transition-colors shadow-sm">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {mockCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          Showing {paginatedProducts.length} of {filteredProducts.length} products
        </p>
        {selectedCategory !== "all" && (
          <Badge variant="secondary" className="ml-2">
            {mockCategories.find((c) => c.id === selectedCategory)?.name}
          </Badge>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={favorites.includes(product.id)}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
