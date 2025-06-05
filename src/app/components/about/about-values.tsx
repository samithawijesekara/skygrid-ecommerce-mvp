import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Shield, Zap, Leaf } from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "Customer First",
    description:
      "We put our customers at the heart of everything we do. Your satisfaction is our top priority, and we're committed to providing exceptional service at every step.",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description:
      "Every product in our store is carefully selected and tested to meet our high standards. We believe in offering only the best to our customers.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "We constantly evolve and adapt to bring you the latest trends and technologies. Our platform is designed to provide a seamless shopping experience.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description:
      "We're committed to environmental responsibility. We work with suppliers who share our values and strive to minimize our environmental impact.",
  },
]

export function AboutValues() {
  return (
    <section className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Our Values</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          These core values guide everything we do and shape the way we serve our customers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {values.map((value, index) => (
          <Card key={index} className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{value.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{value.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
