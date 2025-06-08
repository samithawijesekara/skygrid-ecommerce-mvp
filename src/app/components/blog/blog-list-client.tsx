"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Blog, BlogCategory } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import BlogCard from "./blog-card";
import { BlogListSkeleton } from "@/components/loading-spinners/skelton-loaders";

interface BlogWithRelations extends Blog {
  categories: {
    category: BlogCategory;
  }[];
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

interface BlogResponse {
  items: BlogWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BlogListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [blogs, setBlogs] = useState<BlogWithRelations[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const currentPage = Number(searchParams?.get("page")) || 1;
  const searchQuery = searchParams?.get("search") || "";
  const selectedCategory = searchParams?.get("category") || "all";

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/blog-category");
        const data = await response.json();
        setCategories(data.items);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          take: "9",
          searchValue: searchQuery,
          ...(selectedCategory !== "all" && { categoryId: selectedCategory }),
          isAdmin: "false", // Ensure we only get published articles
        });

        const response = await fetch(`/api/blog?${queryParams}`);
        const data: BlogResponse = await response.json();

        setBlogs(data.items);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, [currentPage, searchQuery, selectedCategory]);

  const handleSearch = (value: string) => {
    if (!searchParams) return;
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/blog?${params.toString()}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    if (!searchParams) return;
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (categoryId && categoryId !== "all") {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    params.set("page", "1");
    router.push(`/blog?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    if (!searchParams) return;
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", page.toString());
    router.push(`/blog?${params.toString()}`);
  };

  const clearFilters = () => {
    if (!searchParams) return;
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete("search");
    params.delete("category");
    params.set("page", "1");
    router.push(`/blog?${params.toString()}`);
  };

  if (isLoading) {
    return <BlogListSkeleton />;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search articles..."
            className="h-9 w-full pr-8 bg-white"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px] h-9 bg-white">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(searchQuery || selectedCategory !== "all") && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>

      {blogs.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl text-muted-foreground">No articles found</h3>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
