"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const pricingPlans = [
  { name: "Free", price: 9, users: "3 users" },
  { name: "Basic", price: 50, users: "10 users" },
  { name: "Team", price: 100, users: "50 users", recommended: true },
  { name: "Enterprise", price: 200, users: "Unlimited users" },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto text-center">
        <h2 className="text-5xl font-bold">Pricing Plans</h2>
        <p className="text-muted-foreground mt-2 text-lg">
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </p>

        <div className="flex items-center justify-center gap-3 mt-6 text-lg">
          <span className="text-gray-600">Annual billing</span>
          <Switch
            checked={isYearly}
            onCheckedChange={() => setIsYearly(!isYearly)}
          />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative flex flex-col justify-between p-8 border border-gray-300 rounded-2xl shadow-md ${
                plan.recommended ? "border-black ring-2 ring-black" : ""
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
                  Recommended
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                </CardTitle>
                <p className="text-gray-500 mt-1">For open source projects</p>
                <p className="text-5xl font-extrabold mt-4">
                  ${isYearly ? plan.price * 10 : plan.price}
                </p>
                <p className="text-sm text-gray-500 mt-1">/ monthly</p>
              </CardHeader>
              <CardContent>
                <p className="text-center text-sm font-semibold text-gray-700 mt-4">
                  OVERVIEW
                </p>
                <p className="text-center text-gray-700 mt-2">✔ {plan.users}</p>
                <p className="text-center text-sm font-semibold text-gray-700 mt-6">
                  HIGHLIGHTS
                </p>
                <ul className="mt-2 space-y-1 text-sm text-center text-gray-700">
                  <li>✔ Included feature</li>
                  <li>✖ Not included feature</li>
                </ul>
              </CardContent>
              <CardFooter className="mt-auto flex justify-center">
                <Button
                  className={`w-full py-3 text-lg rounded-lg ${
                    plan.recommended
                      ? "bg-black text-white"
                      : "bg-gray-900 text-white"
                  }`}
                >
                  Get started for free
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
