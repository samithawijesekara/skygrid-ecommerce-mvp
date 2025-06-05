import { Metadata } from "next";
import BlogListClient from "@/components/blog/blog-list-client";

export const metadata: Metadata = {
  title: "Blog - Latest Articles and Updates",
  description:
    "Discover our latest articles, insights, and updates about our products and industry trends.",
  openGraph: {
    title: "Blog - Latest Articles and Updates",
    description:
      "Discover our latest articles, insights, and updates about our products and industry trends.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Latest Articles and Updates",
    description:
      "Discover our latest articles, insights, and updates about our products and industry trends.",
  },
};

export default function Blog() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-5xl font-bold text-gray-900 mb-8">Blog</h1>
      <BlogListClient />
    </div>
  );
}
