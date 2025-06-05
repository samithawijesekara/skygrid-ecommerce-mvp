// import { headers } from "next/headers";
// import { NextResponse } from "next/server";
// import { Stripe } from "stripe";
// import prisma from "@/lib/prismadb";
// import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";

// async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
//   const userId = subscription.metadata.userId;
//   if (!userId) return;

//   await prisma.subscription.create({
//     data: {
//       userId,
//       planId: subscription.metadata.planId,
//       status: "ACTIVE",
//       stripeCustomerId: subscription.customer as string,
//       stripeSubscriptionId: subscription.id,
//       currentPeriodStart: new Date(subscription.current_period_start * 1000),
//       currentPeriodEnd: new Date(subscription.current_period_end * 1000),
//       trialStart: subscription.trial_start
//         ? new Date(subscription.trial_start * 1000)
//         : null,
//       trialEnd: subscription.trial_end
//         ? new Date(subscription.trial_end * 1000)
//         : null,
//     },
//   });
// }

// async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
//   const userId = subscription.metadata.userId;
//   if (!userId) return;

//   const existingSubscription = await prisma.subscription.findFirst({
//     where: { stripeSubscriptionId: subscription.id },
//   });

//   if (!existingSubscription) return;

//   await prisma.subscription.update({
//     where: { id: existingSubscription.id },
//     data: {
//       status: subscription.status === "active" ? "ACTIVE" : "PAST_DUE",
//       currentPeriodStart: new Date(subscription.current_period_start * 1000),
//       currentPeriodEnd: new Date(subscription.current_period_end * 1000),
//       cancelAtPeriodEnd: subscription.cancel_at_period_end,
//     },
//   });
// }

// async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
//   const existingSubscription = await prisma.subscription.findFirst({
//     where: { stripeSubscriptionId: subscription.id },
//   });

//   if (!existingSubscription) return;

//   await prisma.subscription.update({
//     where: { id: existingSubscription.id },
//     data: {
//       status: "CANCELED",
//       deletedAt: new Date(),
//     },
//   });
// }

// async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
//   if (!invoice.subscription || !invoice.metadata?.userId) return;

//   await prisma.payment.create({
//     data: {
//       userId: invoice.metadata.userId,
//       amount: invoice.amount_paid / 100,
//       currency: invoice.currency,
//       stripePaymentId: invoice.payment_intent as string,
//       status: "succeeded",
//       paymentMethod: invoice.default_payment_method as string,
//     },
//   });

//   const existingSubscription = await prisma.subscription.findFirst({
//     where: { stripeSubscriptionId: invoice.subscription as string },
//   });

//   if (!existingSubscription) return;

//   await prisma.subscription.update({
//     where: { id: existingSubscription.id },
//     data: {
//       status: "ACTIVE",
//     },
//   });
// }

// export async function POST(req: Request) {
//   const body = await req.text();
//   const signature = (await headers()).get("stripe-signature");

//   if (!signature || !STRIPE_WEBHOOK_SECRET) {
//     return new NextResponse("Webhook signature missing", { status: 400 });
//   }

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     return new NextResponse("Webhook signature verification failed", {
//       status: 400,
//     });
//   }

//   try {
//     switch (event.type) {
//       case "customer.subscription.created":
//         await handleSubscriptionCreated(
//           event.data.object as Stripe.Subscription
//         );
//         break;
//       case "customer.subscription.updated":
//         await handleSubscriptionUpdated(
//           event.data.object as Stripe.Subscription
//         );
//         break;
//       case "customer.subscription.deleted":
//         await handleSubscriptionDeleted(
//           event.data.object as Stripe.Subscription
//         );
//         break;
//       case "invoice.payment_succeeded":
//         await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
//         break;
//     }

//     return new NextResponse(null, { status: 200 });
//   } catch (error) {
//     console.error("Error handling webhook:", error);
//     return new NextResponse("Webhook handler failed", { status: 500 });
//   }
// }
