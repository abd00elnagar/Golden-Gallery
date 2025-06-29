"use client"

import { Product, Category } from "@/lib/types"
import { ProductCard } from "./product-card"
import { useState, useMemo } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "./ui/button"

interface ProductsListProps {
    products: Product[]
    categories: Category[],
    favorites: string[] | null,
    userId?: string
}

function ProductsList({ products, categories, favorites, userId }: ProductsListProps) {
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [visibleCount, setVisibleCount] = useState(20)

    const filteredProducts = useMemo(() => {
        let filtered = products

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (product) =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
            )
        }

        // Category filter
        if (selectedCategory !== "all") {
            filtered = filtered.filter((product) => product.category_id === selectedCategory)
        }

        return filtered
    }, [products, searchQuery, selectedCategory])

    // Get visible products based on current count
    const visibleProducts = filteredProducts.slice(0, visibleCount)
    const hasMoreProducts = visibleCount < filteredProducts.length

    const handleViewMore = () => {
        const newCount = visibleCount + 10
        const finalCount = Math.min(newCount, filteredProducts.length)
        setVisibleCount(finalCount)
    }

    const selectedCategoryName = selectedCategory === "all"
        ? "All Categories"
        : categories.find(cat => cat.id === selectedCategory)?.name || "All Categories"

    return (<>
        <div className="space-y-4 mb-6">
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
                {/* Search bar */}
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                    <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                {/* Category Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center justify-between w-full sm:w-48 px-4 py-2 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    >
                        <span className="truncate">{selectedCategoryName}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                            <button
                                onClick={() => {
                                    setSelectedCategory("all")
                                    setIsDropdownOpen(false)
                                }}
                                className={`w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors ${selectedCategory === "all" ? "bg-primary text-primary-foreground" : ""
                                    }`}
                            >
                                All Categories
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => {
                                        setSelectedCategory(category.id)
                                        setIsDropdownOpen(false)
                                    }}
                                    className={`w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors ${selectedCategory === category.id ? "bg-primary text-primary-foreground" : ""
                                        }`}
                                >
                                {category.name}
                                </button>
                        ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
                Showing {visibleProducts.length} of {filteredProducts.length} products
                {searchQuery && (
                    <span className="ml-2">
                        • Search: "{searchQuery}"
                    </span>
                )}
                {selectedCategory !== "all" && (
                    <span className="ml-2">
                        • Category: {selectedCategoryName}
                    </span>
                )}
            </div>
            </div>

        {filteredProducts.length > 0 ? (
            <div className="space-y-6 p-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {visibleProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                            isFavorite={favorites ? favorites.includes(product.id) : false}
                            userId={userId}
                    />
                ))}
            </div>

                {hasMoreProducts && (
                    <div className="flex justify-center">
                        <Button 
                            key={`view-more-${visibleCount}`}
                            onClick={handleViewMore} 
                            className="px-8"
                        >
                            View More ({filteredProducts.length - visibleCount} remaining)
                        </Button>
                    </div>
                )}
            </div>
        ) : (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                    Try adjusting your search or filters to find what you're looking for.
                </p>
        </div>
        )}
    </>
    )
}

export default ProductsList
