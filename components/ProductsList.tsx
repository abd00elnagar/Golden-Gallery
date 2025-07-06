"use client";

import { Product, Category } from "@/lib/types";
import { ProductCard } from "./product-card";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  ChevronDown,
  Heart,
  TrendingUp,
  DollarSign,
  SortAsc,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toggleFavorite } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

interface ProductsListProps {
  products?: Product[];
  categories?: Category[];
  favorites?: string[];
  userId?: string;
  selectedCat?: string;
  searchQuery?: string;
}

type SortOption =
  | "most-liked"
  | "best-seller"
  | "price-low"
  | "price-high"
  | "a-z";

function UnavailableProductCard({
  productId,
  userId,
  onRemove,
}: {
  productId: string;
  userId?: string;
  onRemove?: () => void;
}) {
  const { pending } = useFormStatus();
  const [state, formAction] = useActionState(toggleFavorite, null);
  const { toast } = useToast();
  const [isRemoving, setIsRemoving] = useState(false);

  // Handle form state changes
  useEffect(() => {
    if (state?.success) {
      setIsRemoving(false);
      onRemove?.();
      toast({
        title: "Success",
        description: "Removed from favorites",
      });
    } else if (state?.error) {
      setIsRemoving(false);
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state, toast, onRemove]);

  const handleSubmit = () => {
    setIsRemoving(true);
  };

  // Don't show remove button for fake product IDs
  const isFakeProductId = productId.startsWith("unknown-");

  if (!userId || isFakeProductId) {
    return (
      <div className="border border-dashed border-muted-foreground/20 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
        <div className="text-4xl mb-2">❓</div>
        <p className="text-sm text-muted-foreground">Product unavailable</p>
      </div>
    );
  }

  return (
    <div className="border border-dashed border-muted-foreground/20 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[200px] relative">
      <div className="text-4xl mb-2">❓</div>
      <p className="text-sm text-muted-foreground mb-4">Product unavailable</p>

      <form action={formAction} onSubmit={handleSubmit}>
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="isFavorite" value="true" />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={pending || isRemoving}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          {pending || isRemoving ? "Removing..." : "Remove from Favorites"}
        </Button>
      </form>
    </div>
  );
}

function ProductsList({
  products = [],
  categories = [],
  favorites,
  userId,
  selectedCat,
  searchQuery: externalSearchQuery = "",
}: ProductsListProps) {
  const [selectedCategory, setSelectedCategory] = useState(
    selectedCat ? selectedCat : "all"
  );
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>("most-liked");
  const [visibleCount, setVisibleCount] = useState(20);
  const [removedProducts, setRemovedProducts] = useState<Set<string>>(
    new Set()
  );

  // Use external search query if provided, otherwise use internal state
  const searchQuery = externalSearchQuery || internalSearchQuery;

  // Refs for dropdown auto-close
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter out removed products
  const filteredProducts = products.filter((product) => {
    if ((product as any).notFound) {
      return !removedProducts.has((product as any).id);
    }
    return !removedProducts.has(product.id);
  });

  const handleRemoveProduct = (productId: string) => {
    setRemovedProducts((prev) => new Set([...prev, productId]));
  };

  const sortOptions = [
    {
      value: "most-liked" as SortOption,
      label: "Most Liked",
      icon: Heart,
      iconClass: "text-pink-400",
      selectedIconClass: "text-pink-700",
    },
    {
      value: "best-seller" as SortOption,
      label: "Best Seller",
      icon: TrendingUp,
      iconClass: "text-blue-400",
      selectedIconClass: "text-blue-700",
    },
    {
      value: "price-low" as SortOption,
      label: "Price: Low to High",
      icon: DollarSign,
      iconClass: "text-green-500",
      selectedIconClass: "text-green-700",
    },
    {
      value: "price-high" as SortOption,
      label: "Price: High to Low",
      icon: DollarSign,
      iconClass: "text-green-500",
      selectedIconClass: "text-green-700",
    },
    {
      value: "a-z" as SortOption,
      label: "Name: A to Z",
      icon: SortAsc,
      iconClass: "text-orange-400",
      selectedIconClass: "text-orange-700",
    },
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = filteredProducts;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          false
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category_id === selectedCategory
      );
    }

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case "most-liked":
          return (b.likes || 0) - (a.likes || 0);
        case "best-seller":
          return (b.ordered || 0) - (a.ordered || 0);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "a-z":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [filteredProducts, searchQuery, selectedCategory, selectedSort]);

  // Get visible products based on current count
  const visibleProducts = filteredAndSortedProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredAndSortedProducts.length;

  const handleViewMore = () => {
    const newCount = visibleCount + 10;
    const finalCount = Math.min(newCount, filteredAndSortedProducts.length);
    setVisibleCount(finalCount);
  };

  const selectedCategoryName =
    selectedCategory === "all"
      ? "All Categories"
      : categories.find((cat) => cat.id === selectedCategory)?.name ||
        "All Categories";

  const selectedSortOption = sortOptions.find(
    (option) => option.value === selectedSort
  );

  return (
    <>
      <div className="w-full">
        <div className="space-y-4 mb-6">
          {/* Search, Filter, and Sort Row */}
          <div className="flex flex-col gap-3">
            {/* Search bar */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setInternalSearchQuery(e.target.value)}
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

            {/* Filter and Sort Row */}
            <div className="flex gap-2">
              {/* Category Dropdown */}
              <div className="relative flex-1" ref={categoryDropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between w-full px-4 py-2 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <span className="truncate text-sm">
                    {selectedCategoryName}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-40 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors ${
                        selectedCategory === "all" ? "bg-accent" : ""
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors ${
                          selectedCategory === category.id ? "bg-accent" : ""
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative flex-1" ref={sortDropdownRef}>
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center justify-between w-full px-4 py-2 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <span className="flex items-center gap-2 text-sm">
                    {selectedSortOption && (
                      <selectedSortOption.icon
                        className={`h-4 w-4 ${selectedSortOption.iconClass}`}
                      />
                    )}
                    <span className="truncate">
                      {selectedSortOption?.label}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isSortDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Sort Dropdown Menu */}
                {isSortDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-40 min-w-[200px]">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedSort(option.value);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 ${
                          selectedSort === option.value ? "bg-accent" : ""
                        }`}
                      >
                        <option.icon
                          className={`h-4 w-4 ${
                            selectedSort === option.value
                              ? option.selectedIconClass
                              : option.iconClass
                          }`}
                        />
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {visibleProducts.map((product) => (
            <div key={product.id}>
              {(product as any).notFound ? (
                <UnavailableProductCard
                  productId={product.id}
                  userId={userId}
                  onRemove={() => handleRemoveProduct(product.id)}
                />
              ) : (
                <ProductCard
                  product={product}
                  isFavorite={favorites?.includes(product.id) || false}
                  userId={userId}
                />
              )}
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMoreProducts && (
          <div className="flex justify-center mt-8 mb-8">
            <Button
              onClick={handleViewMore}
              variant="outline"
              size="lg"
              className="w-full max-w-xs"
            >
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default ProductsList;
