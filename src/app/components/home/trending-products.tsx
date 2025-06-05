"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, TrendingUp } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { useToast } from "../ui/use-toast";

const trendingProducts = [
  {
    id: 5,
    name: "Sustainable Water Bottle",
    price: 24.99,
    image: "/placeholder.svg?height=300&width=300",
    trend: "+15%",
    category: "Lifestyle",
  },
  {
    id: 6,
    name: "Wireless Charging Pad",
    price: 49.99,
    image: "/placeholder.svg?height=300&width=300",
    trend: "+23%",
    category: "Tech",
  },
  {
    id: 7,
    name: "Artisan Coffee Mug",
    price: 19.99,
    image: "/placeholder.svg?height=300&width=300",
    trend: "+8%",
    category: "Home",
  },
  {
    id: 8,
    name: "Bluetooth Speaker",
    price: 79.99,
    image: "/placeholder.svg?height=300&width=300",
    trend: "+31%",
    category: "Audio",
  },
  {
    id: 9,
    name: "Yoga Mat Premium",
    price: 59.99,
    image: "/placeholder.svg?height=300&width=300",
    trend: "+12%",
    category: "Fitness",
  },
  {
    id: 10,
    name: "LED Desk Lamp",
    price: 39.99,
    image: "/placeholder.svg?height=300&width=300",
    trend: "+19%",
    category: "Office",
  },
];

export function TrendingProducts() {
  const { addItem } = useCart();
  const [favorites, setFavorites] = useState<number[]>([]);
  const { toast } = useToast();

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddToCart = (product: (typeof trendingProducts)[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    toast({
      title: "Added to cart",
      description: `${product.name} added to cart`,
    });
  };

  return (
    <section className="container mx-auto px-4 py-16 bg-muted/30">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-3xl lg:text-4xl font-bold">Trending Now</h2>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          See what's popular right now. These products are flying off our
          shelves!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingProducts.map((product) => (
          <Card
            key={product.id}
            className="group overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-0">
              <div className="relative overflow-hidden">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex space-x-2">
                  <Badge variant="destructive" className="bg-green-500">
                    {product.trend}
                  </Badge>
                  <Badge variant="outline" className="bg-white/90">
                    {product.category}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                  onClick={() => toggleFavorite(product.id)}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      favorites.includes(product.id)
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                </Button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">${product.price}</span>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ShoppingCart className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
