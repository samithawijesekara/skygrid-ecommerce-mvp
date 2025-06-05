"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { useCart } from "@/components/cart/cart-context"
import { useToast } from "@/components/ui/use-toast"

const favoriteProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 299.99,
    originalPrice: 399.99,
    image: "/placeholder.svg?height=300&width=300",
    inStock: true,
  },
  {
    id: 3,
    name: "Minimalist Backpack",
    price: 89.99,
    originalPrice: 119.99,
    image: "/placeholder.svg?height=300&width=300",
    inStock: true,
  },
  {
    id: 5,
    name: "Sustainable Water Bottle",
    price: 24.99,
    image: "/placeholder.svg?height=300&width=300",
    inStock: false,
  },
]

export function Favorites() {
  const { addItem } = useCart()
  const [favorites, setFavorites] = useState(favoriteProducts)
  const { toast } = useToast()

  const removeFavorite = (productId: number) => {
    setFavorites((prev) => prev.filter((item) => item.id !== productId))
    toast({
      description: "Removed from favorites",
    })
  }

  const handleAddToCart = (product: (typeof favoriteProducts)[0]) => {
    if (!product.inStock) {
      toast({
        title: "Error",
        description: "Product is out of stock",
        variant: "destructive",
      })
      return
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    })
    toast({
      title: "Added to cart",
      description: `${product.name} added to cart`,
    })
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
        <p className="text-muted-foreground mb-6">Start adding products to your favorites to see them here</p>
        <Button asChild>
          <a href="/shop">Browse Products</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((product) => (
        <Card key={product.id} className="group overflow-hidden">
          <CardContent className="p-0">
            <div className="relative overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={300}
                height={300}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold">Out of Stock</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                onClick={() => removeFavorite(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-semibold line-clamp-2">{product.name}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                )}
              </div>
              <Button onClick={() => handleAddToCart(product)} disabled={!product.inStock} className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
