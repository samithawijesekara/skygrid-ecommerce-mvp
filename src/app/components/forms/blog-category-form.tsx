"use client";
import React, { useState } from "react";
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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type CategoryFormProps = {
  category?: any;
  onClose: () => void;
  onSuccess: () => void;
};

const formLabelClass = "text-gray-700 font-medium";

export function BlogCategoryForm({
  category,
  onClose,
  onSuccess,
}: CategoryFormProps) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      if (category) {
        await axios.put(`/api/blog-category/${category.id}`, values);
        toast.success("Category updated successfully");
      } else {
        await axios.post("/api/blog-category", {
          ...values,
          createdById: user?.id,
        });
        toast.success("Category created successfully");
      }
      onSuccess();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex-1">
        <SheetHeader>
          <SheetTitle>
            {category ? "Edit Category" : "Add New Category"}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={formLabelClass}>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={formLabelClass}>
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter category description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t p-4 space-y-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : category
                  ? "Update Category"
                  : "Create Category"}
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
