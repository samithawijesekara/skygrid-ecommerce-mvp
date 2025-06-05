"use client";
import { SubscriptionCard } from "./SubscriptionCard";
import type { SubscriptionPlan } from "@prisma/client";

interface SubscriptionCardWrapperProps {
  plan: SubscriptionPlan;
}

export function SubscriptionCardWrapper({
  plan,
}: SubscriptionCardWrapperProps) {
  return (
    <SubscriptionCard
      key={plan.id}
      name={plan.name}
      description={plan.description || ""}
      price={plan.price}
      interval={plan.interval}
      features={plan.features}
      stripePriceId={plan.stripePriceId}
      isPopular={plan.planType === "PRO_MONTHLY"}
      trialDays={plan.trialDays}
    />
  );
}
