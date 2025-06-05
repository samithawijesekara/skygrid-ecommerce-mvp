import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Smartphone,
  Headphones,
  Laptop,
  Shirt,
  Watch,
  Footprints,
  Home,
  Dumbbell,
  Book,
  Gamepad2,
  Camera,
  Car,
} from "lucide-react"

const categories = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Latest gadgets and tech",
    icon: Smartphone,
    productCount: 245,
    color: "bg-blue-500",
    featured: true,
  },
  {
    id: "audio",
    name: "Audio & Music",
    description: "Headphones, speakers & more",
    icon: Headphones,
    productCount: 89,
    color: "bg-purple-500",
  },
  {
    id: "computers",
    name: "Computers",
    description: "Laptops, desktops & accessories",
    icon: Laptop,
    productCount: 156,
    color: "bg-green-500",
  },
  {
    id: "fashion",
    name: "Fashion",
    description: "Clothing for all occasions",
    icon: Shirt,
    productCount: 432,
    color: "bg-pink-500",
    featured: true,
  },
  {
    id: "watches",
    name: "Watches",
    description: "Smart & traditional timepieces",
    icon: Watch,
    productCount: 78,
    color: "bg-yellow-500",
  },
  {
    id: "shoes",
    name: "Shoes",
    description: "Footwear for every style",
    icon: Footprints,
    productCount: 198,
    color: "bg-red-500",
  },
  {
    id: "home",
    name: "Home & Garden",
    description: "Decor, furniture & tools",
    icon: Home,
    productCount: 324,
    color: "bg-teal-500",
    featured: true,
  },
  {
    id: "fitness",
    name: "Sports & Fitness",
    description: "Equipment & activewear",
    icon: Dumbbell,
    productCount: 167,
    color: "bg-orange-500",
  },
  {
    id: "books",
    name: "Books",
    description: "Literature & educational",
    icon: Book,
    productCount: 543,
    color: "bg-indigo-500",
  },
  {
    id: "gaming",
    name: "Gaming",
    description: "Consoles, games & accessories",
    icon: Gamepad2,
    productCount: 234,
    color: "bg-violet-500",
  },
  {
    id: "photography",
    name: "Photography",
    description: "Cameras & photo equipment",
    icon: Camera,
    productCount: 112,
    color: "bg-cyan-500",
  },
  {
    id: "automotive",
    name: "Automotive",
    description: "Car accessories & parts",
    icon: Car,
    productCount: 189,
    color: "bg-slate-500",
  },
]

export function CategoriesGrid() {
  return (
    <section className="container mx-auto px-4 pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link key={category.id} href={`/shop?category=${category.id}`}>
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-6 text-center space-y-4">
                <div className="relative">
                  <div
                    className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}
                  >
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                  {category.featured && <Badge className="absolute -top-2 -right-2 bg-primary">Featured</Badge>}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                  <p className="text-xs text-muted-foreground">{category.productCount} products</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
