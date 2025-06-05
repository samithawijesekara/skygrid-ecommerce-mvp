import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react"

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Our Store",
    details: ["123 Commerce Street", "New York, NY 10001", "United States"],
    action: "Get Directions",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+1 (555) 123-4567", "Mon-Fri: 9AM-6PM EST", "Sat-Sun: 10AM-4PM EST"],
    action: "Call Now",
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["support@modernstore.com", "sales@modernstore.com", "We reply within 24 hours"],
    action: "Send Email",
  },
]

export function ContactInfo() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
        <p className="text-muted-foreground">
          Choose the most convenient way to reach us. We're here to help and answer any questions you may have.
        </p>
      </div>

      <div className="space-y-4">
        {contactInfo.map((info, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-3 text-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <info.icon className="h-5 w-5 text-primary" />
                </div>
                <span>{info.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground">
                    {detail}
                  </p>
                ))}
              </div>
              <Button variant="outline" size="sm">
                {info.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-6 text-center space-y-4">
          <MessageCircle className="h-12 w-12 mx-auto" />
          <div>
            <h3 className="font-semibold text-lg mb-2">Live Chat Support</h3>
            <p className="text-sm opacity-90 mb-4">
              Get instant help from our support team. Available 24/7 for urgent matters.
            </p>
            <Button variant="secondary">Start Live Chat</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
