import { Card, CardContent } from "@/components/ui/card"
import { Users, Package, Award, Globe } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "50K+",
    label: "Happy Customers",
    description: "Satisfied customers worldwide",
  },
  {
    icon: Package,
    value: "10K+",
    label: "Products Sold",
    description: "Quality products delivered",
  },
  {
    icon: Award,
    value: "5 Years",
    label: "Experience",
    description: "In the ecommerce industry",
  },
  {
    icon: Globe,
    value: "25+",
    label: "Countries",
    description: "We ship worldwide",
  },
]

export function AboutStats() {
  return (
    <section className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-6 space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="font-semibold">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
