export const SUBSCRIPTION_SETTINGS = {
  TRIAL: {
    ENABLED: true,
    DAYS: 14,
  },
  PLANS: {
    FREE: {
      name: 'Free',
      description: 'Perfect for getting started',
      price: 0,
      interval: 'month',
      features: [
        'Basic features',
        'Limited storage',
        'Community support',
      ],
    },
    PRO_MONTHLY: {
      name: 'Pro Monthly',
      description: 'Best for professionals',
      price: 19,
      interval: 'month',
      features: [
        'All Free features',
        'Unlimited storage',
        'Priority support',
        'Advanced analytics',
        'Custom domains',
      ],
    },
    PRO_ANNUAL: {
      name: 'Pro Annual',
      description: 'Save 20% with annual billing',
      price: 180,
      interval: 'year',
      features: [
        'All Pro Monthly features',
        'Two months free',
        'Dedicated account manager',
        'Custom integrations',
      ],
    },
  },
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_SETTINGS.PLANS;

export function getPlanFeatures(plan: SubscriptionPlan) {
  return SUBSCRIPTION_SETTINGS.PLANS[plan].features;
}

export function getPlanPrice(plan: SubscriptionPlan) {
  return SUBSCRIPTION_SETTINGS.PLANS[plan].price;
}

export function isTrialEnabled() {
  return SUBSCRIPTION_SETTINGS.TRIAL.ENABLED;
}

export function getTrialDays() {
  return SUBSCRIPTION_SETTINGS.TRIAL.DAYS;
} 