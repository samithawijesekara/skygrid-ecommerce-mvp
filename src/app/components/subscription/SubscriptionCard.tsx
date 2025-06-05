"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { toast } from "react-toastify";

interface SubscriptionCardProps {
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  stripePriceId: string;
  isPopular?: boolean;
  trialDays?: number;
}

export function SubscriptionCard({
  name,
  description,
  price,
  interval,
  features,
  stripePriceId,
  isPopular,
  trialDays = 0,
}: SubscriptionCardProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: stripePriceId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
          trialDays,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      window.location.href = data.url;
    } catch (error) {
      toast.error("Failed to create subscription");
      console.error("Subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`w-[300px] ${isPopular ? "border-primary" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{name}</CardTitle>
          {isPopular && (
            <Badge variant="secondary" className="ml-2">
              Popular
            </Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold">${price}</span>
          <span className="ml-1 text-muted-foreground">/{interval}</span>
        </div>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubscribe}
          disabled={!session || isLoading}
        >
          {isLoading
            ? "Processing..."
            : trialDays > 0
            ? `Start ${trialDays}-day free trial`
            : `Subscribe`}
        </Button>
      </CardFooter>
    </Card>
  );
}
