"use client"

import { useState, useMemo } from "react"
import { ProductGrid } from "./product-grid"
import { ProductFilters } from "./product-filters"
import { ProductSort } from "./product-sort"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Mock product data
const allProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 299.99,
    originalPrice: 399.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Electronics",
    brand: "TechPro",
    rating: 4.8,
    inStock: true,
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    price: 199.99,
    originalPrice: 249.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Electronics",
    brand: "FitTech",
    rating: 4.9,
    inStock: true,
  },
  {
    id: 3,
    name: "Minimalist Backpack",
    price: 89.99,
    originalPrice: 119.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Fashion",
    brand: "UrbanStyle",
    rating: 4.7,
    inStock: true,
  },
  {
    id: 4,
    name: "Organic Cotton T-Shirt",
    price: 29.99,
    originalPrice: 39.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Fashion",
    brand: "EcoWear",
    rating: 4.6,
    inStock: false,
  },
  {
    id: 5,
    name: "Sustainable Water Bottle",
    price: 24.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Lifestyle",
    brand: "GreenLife",
    rating: 4.5,
    inStock: true,
  },
  {
    id: 6,
    name: "Wireless Charging Pad",
    price: 49.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "Electronics",
    brand: "ChargeTech",
    rating: 4.4,
    inStock: true,
  },
  // Add more products for demonstration
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 7,
    name: `Product ${i + 7}`,
    price: Math.floor(Math.random() * 200) + 20,
    image: "/placeholder.svg?height=300&width=300",
    category: ["Electronics", "Fashion", "Lifestyle"][Math.floor(Math.random() * 3)],
    brand: ["TechPro", "FitTech", "UrbanStyle", "EcoWear", "GreenLife"][Math.floor(Math.random() * 5)],
    rating: 4 + Math.random(),
    inStock: Math.random() > 0.2,
  })),
]

export function ShopContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 500])
  const [sortBy, setSortBy] = useState("featured")
  const [showInStockOnly, setShowInStockOnly] = useState(false)

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false
      }

      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false
      }

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false
      }

      // Stock filter
      if (showInStockOnly && !product.inStock) {
        return false
      }

      return true
    })
  }, [searchQuery, selectedCategories, selectedBrands, priceRange, showInStockOnly])

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts]

    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price)
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price)
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating)
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return sorted
    }
  }, [filteredProducts, sortBy])

  const categories = Array.from(new Set(allProducts.map((p) => p.category)))
  const brands = Array.from(new Set(allProducts.map((p) => p.brand)))

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-8">
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <ProductFilters
          categories={categories}
          brands={brands}
          selectedCategories={selectedCategories}
          selectedBrands={selectedBrands}
          priceRange={priceRange}
          showInStockOnly={showInStockOnly}
          onCategoriesChange={setSelectedCategories}
          onBrandsChange={setSelectedBrands}
          onPriceRangeChange={setPriceRange}
          onStockFilterChange={setShowInStockOnly}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      <div className="space-y-6">
        {/* Mobile Filters & Sort */}
        <div className="flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <ProductFilters
                categories={categories}
                brands={brands}
                selectedCategories={selectedCategories}
                selectedBrands={selectedBrands}
                priceRange={priceRange}
                showInStockOnly={showInStockOnly}
                onCategoriesChange={setSelectedCategories}
                onBrandsChange={setSelectedBrands}
                onPriceRangeChange={setPriceRange}
                onStockFilterChange={setShowInStockOnly}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </SheetContent>
          </Sheet>

          <ProductSort sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {sortedProducts.length} of {allProducts.length} products
        </div>

        {/* Product Grid */}
        <ProductGrid products={sortedProducts} />
      </div>
    </div>
  )
}
