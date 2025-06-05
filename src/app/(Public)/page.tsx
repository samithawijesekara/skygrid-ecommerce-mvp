import FAQ from "@/components/public/faq";
import Features from "@/components/public/features";
import Hero from "@/components/public/hero";
import Pricing from "@/components/public/pricing";
import Testimonial from "@/components/public/testimonial";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Testimonial />
      <FAQ />
    </>
  );
}
