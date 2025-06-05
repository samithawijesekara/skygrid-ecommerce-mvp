import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Linkedin, Twitter } from "lucide-react"

const team = [
  {
    name: "Sarah Johnson",
    role: "Founder & CEO",
    image: "/placeholder.svg?height=200&width=200",
    initials: "SJ",
    bio: "Passionate entrepreneur with 10+ years in retail and ecommerce.",
  },
  {
    name: "Michael Chen",
    role: "Head of Product",
    image: "/placeholder.svg?height=200&width=200",
    initials: "MC",
    bio: "Product strategist focused on creating exceptional user experiences.",
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Director",
    image: "/placeholder.svg?height=200&width=200",
    initials: "ER",
    bio: "Creative marketer with expertise in digital brand building.",
  },
  {
    name: "David Kim",
    role: "Head of Operations",
    image: "/placeholder.svg?height=200&width=200",
    initials: "DK",
    bio: "Operations expert ensuring smooth delivery and customer satisfaction.",
  },
]

export function AboutTeam() {
  return (
    <section className="container mx-auto px-4 bg-muted/30 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Meet Our Team</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          The passionate people behind Modern Store who work tirelessly to bring you the best shopping experience.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {team.map((member, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-6 space-y-4">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={member.image || "/placeholder.svg"} alt={member.name} />
                <AvatarFallback className="text-lg">{member.initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-primary font-medium">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
              <div className="flex justify-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Twitter className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
