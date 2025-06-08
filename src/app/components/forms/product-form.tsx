"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import axios from "axios";
import { toast } from "react-toastify";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "src/store/useUser";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  isPublished: z.boolean().default(false),
  file: z.any().optional(),
});

type ProductFormProps = {
  product?: any;
  onClose: () => void;
  onSuccess: () => void;
};

const formLabelClass = "text-gray-700 font-medium";

export function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(
    product?.coverImage || null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product?.title || "",
      content: product?.content || "",
      categoryIds:
        product?.categories?.map((cat: any) => cat.category.id) || [],
      isPublished: product?.isPublished || false,
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/product-category");
      setCategories(response.data.items);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("isPublished", values.isPublished.toString());
      values.categoryIds.forEach((id) => {
        formData.append("categoryIds[]", id);
      });

      if (selectedImage) {
        formData.append("file", selectedImage);
      } else if (existingImage) {
        formData.append("coverImage", existingImage);
      }

      if (product) {
        await axios.put(`/api/product/${product.id}`, formData);
        toast.success("Product updated successfully");
      } else {
        // formData.append("createdById", user?.id);
        await axios.post("/api/product", formData);
        toast.success("Product created successfully");
      }
      onSuccess();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex-1">
        <SheetHeader>
          <SheetTitle>
            {product ? "Edit Product" : "Add New Product"}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4 h-full flex flex-col"
          >
            <div className="space-y-4 flex-1">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={formLabelClass}>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product title" {...field} />
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
                    <FormLabel className={formLabelClass}>
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter product description"
                        className="resize-none"
                        {...field}
                      />
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
                    <FormLabel className={formLabelClass}>Categories</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const currentValues = field.value || [];
                        if (!currentValues.includes(value)) {
                          field.onChange([...currentValues, value]);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select categories" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value?.map((categoryId) => {
                        const category = categories.find(
                          (c) => c.id === categoryId
                        );
                        return (
                          category && (
                            <div
                              key={categoryId}
                              className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md"
                            >
                              <span>{category.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(
                                    field.value?.filter(
                                      (id) => id !== categoryId
                                    )
                                  );
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          )
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="file"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className={formLabelClass}>
                      Product Image
                    </FormLabel>
                    <FormControl>
                      {/* <ImageUpload
                        value={existingImage}
                        onChange={(file) => {
                          setSelectedImage(file);
                          setExistingImage(null);
                        }}
                        onRemove={() => {
                          setSelectedImage(null);
                          setExistingImage(null);
                        }}
                      /> */}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Publish Product</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t p-4 space-y-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : product
                  ? "Update Product"
                  : "Create Product"}
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
