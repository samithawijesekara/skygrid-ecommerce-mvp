"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { Newsletter } from "@/components/home/newsletter";
import { TrendingProducts } from "@/components/home/trending-products";
import FAQ from "@/components/public/faq";
import Features from "@/components/public/features";
import Pricing from "@/components/public/pricing";
import Testimonial from "@/components/public/testimonial";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState("login");

  useEffect(() => {
    if (searchParams && searchParams.get("login") === "true") {
      setIsAuthOpen(true);
      setDefaultTab("login");
      router.replace("/", { scroll: false });
    } else if (searchParams && searchParams.get("signup") === "true") {
      setIsAuthOpen(true);
      setDefaultTab("signup");
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <>
      <AuthDialog
        open={isAuthOpen}
        setOpen={setIsAuthOpen}
        defaultTab={defaultTab}
      />
      <div className="space-y-16">
        <Hero />
        <FeaturedProducts />
        <TrendingProducts />
        <Newsletter />
      </div>
    </>
  );
}
