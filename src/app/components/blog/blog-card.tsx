import Image from "next/image";
import Link from "next/link";
import { Blog, Category } from "@prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";

type BlogWithRelations = Blog & {
  categories: {
    category: Category;
  }[];
};

interface BlogCardProps {
  blog: BlogWithRelations;
}

export default function BlogCard({ blog }: BlogCardProps) {
  // Create URL-friendly slug from title
  const slug = blog.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return (
    <Link href={`/blog/${slug}`}>
      <Card className="group h-full overflow-hidden hover:shadow-md transition-shadow duration-300 border-none">
        <div className="relative h-48 w-full bg-muted">
          {blog.coverImage ? (
            <Image
              src={`https://skybird-saas-boilerplate.s3.us-east-1.amazonaws.com/${blog.coverImage}`}
              alt={blog.title}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {blog.categories.map(({ category }) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>
          <h2 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors duration-300">
            {blog.title}
          </h2>
        </CardHeader>
      </Card>
    </Link>
  );
}
