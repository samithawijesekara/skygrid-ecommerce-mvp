import { PrismaClient, PlanType } from "@prisma/client";

const prisma = new PrismaClient();

const plans = [
  {
    name: "Free Plan",
    description: "Get started with basic features",
    planType: "FREE" as PlanType,
    price: 0,
    currency: "USD",
    interval: "month",
    stripePriceId: "", // No Stripe price ID needed for free plan
    features: ["Basic features", "Limited storage", "Community support"],
    isActive: true,
    trialDays: 0,
  },
  {
    name: "Pro Monthly",
    description: "Perfect for professionals",
    planType: "PRO_MONTHLY" as PlanType,
    price: 19.99,
    currency: "USD",
    interval: "month",
    stripePriceId: "price_XXXXX", // Replace with your Stripe price ID
    features: [
      "All Free features",
      "Unlimited storage",
      "Priority support",
      "Advanced analytics",
      "Custom domains",
    ],
    isActive: true,
    trialDays: 14,
  },
  {
    name: "Pro Annual",
    description: "Best value for long-term users",
    planType: "PRO_ANNUAL" as PlanType,
    price: 199.99,
    currency: "USD",
    interval: "year",
    stripePriceId: "price_YYYYY", // Replace with your Stripe price ID
    features: [
      "All Pro Monthly features",
      "Two months free",
      "Dedicated account manager",
      "Custom integrations",
    ],
    isActive: true,
    trialDays: 14,
  },
];

async function seedSubscriptionPlans() {
  try {
    // Delete existing plans
    await prisma.subscriptionPlan.deleteMany();

    // Create new plans
    for (const plan of plans) {
      await prisma.subscriptionPlan.create({
        data: plan,
      });
    }

    console.log("✅ Subscription plans seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding subscription plans:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// // Run if called directly
// if (require.main === module) {
//   seedSubscriptionPlans();
// }

export { seedSubscriptionPlans };
