import { CategoriesHero } from "@/components/categories/categories-hero"
import { CategoriesGrid } from "@/components/categories/categories-grid"

export default function CategoriesPage() {
  return (
    <div className="space-y-16">
      <CategoriesHero />
      <CategoriesGrid />
    </div>
  )
}
