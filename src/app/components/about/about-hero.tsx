import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function AboutHero() {
  return (
    <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
              About
              <span className="text-primary block">Modern Store</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're passionate about bringing you the finest products with exceptional quality and unmatched customer
              service. Our journey began with a simple mission: to make premium shopping accessible to everyone.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Our Story
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Meet the Team
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
