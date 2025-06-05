// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import prisma from "@/lib/prismadb";
// import { authOptions } from "src/pages/api/auth/[...nextauth]";
// import {
//   cancelSubscription,
//   createCheckoutSession,
//   createStripeCustomer,
// } from "@/lib/stripe";

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const { priceId, successUrl, cancelUrl, trialDays } = await req.json();

//     if (!priceId || !successUrl || !cancelUrl) {
//       return new NextResponse("Missing required fields", { status: 400 });
//     }

//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email! },
//       include: { subscriptions: true },
//     });

//     if (!user) {
//       return new NextResponse("User not found", { status: 404 });
//     }

//     // Check if user already has an active subscription
//     const activeSubscription = user.subscriptions.find(
//       (sub) => sub.status === "ACTIVE" || sub.status === "TRIAL"
//     );

//     if (activeSubscription) {
//       return new NextResponse("User already has an active subscription", {
//         status: 400,
//       });
//     }

//     // Create or retrieve Stripe customer
//     let stripeCustomerId = user.subscriptions[0]?.stripeCustomerId;
//     if (!stripeCustomerId) {
//       const customer = await createStripeCustomer(
//         user.email!,
//         `${user.firstName} ${user.lastName}`
//       );
//       stripeCustomerId = customer.id;
//     }

//     // Create checkout session
//     const checkoutSession = await createCheckoutSession({
//       priceId,
//       userId: user.id,
//       successUrl,
//       cancelUrl,
//       trialDays,
//     });

//     return NextResponse.json({ url: checkoutSession.url });
//   } catch (error) {
//     console.error("Error creating subscription:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }

// export async function DELETE(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email! },
//       include: { subscriptions: true },
//     });

//     if (!user) {
//       return new NextResponse("User not found", { status: 404 });
//     }

//     const activeSubscription = user.subscriptions.find(
//       (sub) => sub.status === "ACTIVE" || sub.status === "TRIAL"
//     );

//     if (!activeSubscription?.stripeSubscriptionId) {
//       return new NextResponse("No active subscription found", { status: 404 });
//     }

//     await cancelSubscription(activeSubscription.stripeSubscriptionId);

//     return new NextResponse(null, { status: 200 });
//   } catch (error) {
//     console.error("Error canceling subscription:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }

// export async function GET(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email! },
//       include: {
//         subscriptions: {
//           include: {
//             plan: true,
//           },
//           where: {
//             OR: [
//               { status: "ACTIVE" },
//               { status: "TRIAL" },
//               {
//                 AND: [
//                   { status: "CANCELED" },
//                   { currentPeriodEnd: { gt: new Date() } },
//                 ],
//               },
//             ],
//           },
//         },
//       },
//     });

//     if (!user) {
//       return new NextResponse("User not found", { status: 404 });
//     }

//     return NextResponse.json({ subscription: user.subscriptions[0] || null });
//   } catch (error) {
//     console.error("Error fetching subscription:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }
