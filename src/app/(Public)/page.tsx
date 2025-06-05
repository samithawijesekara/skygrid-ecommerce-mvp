import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { Newsletter } from "@/components/home/newsletter";
import { TrendingProducts } from "@/components/home/trending-products";
import FAQ from "@/components/public/faq";
import Features from "@/components/public/features";
import Pricing from "@/components/public/pricing";
import Testimonial from "@/components/public/testimonial";

export default function Home() {
  return (
    <div className="space-y-16">
      <Hero />
      <FeaturedProducts />
      <TrendingProducts />
      <Newsletter />
    </div>
  );
}
