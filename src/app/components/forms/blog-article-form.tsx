"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Editor } from "../blog/editor";
import { toast } from "react-toastify";
import { useBlogCategories } from "src/hooks/use-blogCategories";
import { ImageUpload } from "../ui/image-upload";
import { MultiSelect } from "../ui/multi-select";
import { useUser } from "src/store/useUser";
import axios from "axios";
import { SUPER_ADMIN_ROUTES } from "@/constants/router.const";
import "react-quill/dist/quill.snow.css";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  coverImage: z
    .union([z.string(), z.instanceof(File), z.literal(null)])
    .superRefine((val, ctx) => {
      if (!val) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cover image is required",
        });
      }
    }),
});

interface BlogArticleFormProps {
  blogId?: string;
}

export function BlogArticleForm({ blogId }: BlogArticleFormProps) {
  const { user } = useUser();
  const router = useRouter();
  const { categories, loading } = useBlogCategories();
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  const [blog, setBlog] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryIds: [],
      coverImage: null,
    },
  });

  useEffect(() => {
    if (blogId) {
      fetchBlogData();
    }
  }, [blogId]);

  const fetchBlogData = async () => {
    try {
      setIsDraftLoading(true);
      const response = await axios.get(`/api/blog/${blogId}`);
      const blogData = response.data;
      setBlog(blogData);

      form.reset({
        title: blogData.title,
        content: blogData.content || "",
        categoryIds: blogData.categories.map((cat: any) => cat.category.id),
        coverImage: blogData.coverImage
          ? `https://skybird-saas-boilerplate.s3.us-east-1.amazonaws.com/${blogData.coverImage}`
          : null,
      });

      form.setValue("content", blogData.content || "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      console.error("Error fetching blog:", error);
      toast.error("Failed to fetch blog data");
    } finally {
      setIsDraftLoading(false);
    }
  };

  const onSubmit = async (
    values: z.infer<typeof formSchema>,
    action: "draft" | "publish"
  ) => {
    try {
      if (action === "draft") {
        setIsDraftLoading(true);
      } else {
        setIsPublishLoading(true);
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("createdById", user?.id || "");
      formData.append("isPublished", (action === "publish").toString());
      values.categoryIds.forEach((id) => formData.append("categoryIds[]", id));

      // Handle cover image
      if (values.coverImage instanceof File) {
        formData.append("file", values.coverImage);
      } else if (values.coverImage === null && blog?.coverImage) {
        // If coverImage is null and there was a previous image, indicate removal
        formData.append("removeCoverImage", "true");
      } else if (typeof values.coverImage === "string") {
        // If it's a string URL, extract the relative path from the S3 URL
        const relativePath = values.coverImage.split("amazonaws.com/")[1];
        formData.append("coverImage", relativePath);
      }

      const response = await fetch(
        blogId ? `/api/blog/${blogId}` : "/api/blog",
        {
          method: blogId ? "PUT" : "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message ||
            `Failed to ${blogId ? "update" : "create"} blog article`
        );
      }

      toast.success(
        `Blog article ${
          action === "draft" ? "saved as draft" : "published"
        } successfully`
      );
      router.push(SUPER_ADMIN_ROUTES.BLOG_ALL_ARTICLES);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${blogId ? "update" : "create"} blog article`
      );
    } finally {
      if (action === "draft") {
        setIsDraftLoading(false);
      } else {
        setIsPublishLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log(form.getValues());
  }, [form.getValues()]);

  return (
    <Form {...form}>
      <form className="space-y-8">
        <Card className="p-6">
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-foreground">Cover Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value || null}
                      onChange={field.onChange}
                      className="h-[300px]"
                      error={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter article title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={
                        categories?.map((category) => ({
                          value: category.id,
                          label: category.name,
                        })) || []
                      }
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={loading ? "Loading..." : "Select categories"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Editor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write your article content here..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            {(!blogId || (blogId && !blog?.isPublished)) && (
              <Button
                type="button"
                variant="outline"
                disabled={isDraftLoading || isPublishLoading}
                onClick={() =>
                  form.handleSubmit((values) => onSubmit(values, "draft"))()
                }
              >
                {isDraftLoading ? "Saving..." : "Save as Draft"}
              </Button>
            )}
            <Button
              type="button"
              disabled={isDraftLoading || isPublishLoading}
              onClick={() =>
                form.handleSubmit((values) => onSubmit(values, "publish"))()
              }
            >
              {isPublishLoading
                ? "Saving..."
                : blogId
                ? blog?.isPublished
                  ? "Update"
                  : "Publish"
                : "Publish Article"}
            </Button>
          </div>
        </Card>
      </form>
    </Form>
  );
}
