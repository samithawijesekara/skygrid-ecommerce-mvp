"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Eye, EyeOff, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProductForm } from "@/components/forms/product-form";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { SUPER_ADMIN_ROUTES } from "@/constants/router.const";

export function ProductDetailsPageComponent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchProductDetails = async () => {
    if (!params?.id) {
      toast.error("Product ID is missing");
      router.push("/products");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`/api/product/${params.id}`);
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to fetch product details");
      router.push(`${SUPER_ADMIN_ROUTES.PRODUCTS}`); // Redirect to products list on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      fetchProductDetails();
    }
  }, [params?.id]);

  const handleDeleteProduct = async () => {
    if (!params?.id) {
      toast.error("Product ID is missing");
      return;
    }

    try {
      await axios.delete(`/api/product/${params.id}`);
      toast.success("Product deleted successfully");
      router.push(`${SUPER_ADMIN_ROUTES.PRODUCTS}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  const handleFormSuccess = () => {
    setIsProductFormOpen(false);
    fetchProductDetails();
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="grid gap-4">
          <div className="h-[400px] bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-32 bg-slate-200 animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Product not found
        </h2>
        <p className="mt-2 text-gray-600">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push(`${SUPER_ADMIN_ROUTES.PRODUCTS}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`${SUPER_ADMIN_ROUTES.PRODUCTS}`)}
            className="h-9"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {product.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-9">
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[600px]">
              <ProductForm
                product={product}
                onClose={() => setIsProductFormOpen(false)}
                onSuccess={handleFormSuccess}
              />
            </SheetContent>
          </Sheet>
          <Button
            variant="destructive"
            className="h-9"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              {product.coverImage ? (
                <Image
                  src={product.coverImage}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                  <svg
                    className="h-12 w-12 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <Badge
                  variant={product.isPublished ? "default" : "secondary"}
                  className="mt-1"
                >
                  {product.isPublished ? (
                    <Eye className="mr-1 h-4 w-4" />
                  ) : (
                    <EyeOff className="mr-1 h-4 w-4" />
                  )}
                  {product.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Categories
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.categories?.map((cat: any) => (
                    <Badge key={cat.category.id} variant="outline">
                      {cat.category.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Created At
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(product.createdAt), "PPP")}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Last Updated
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(product.updatedAt), "PPP")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{product.content}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
        }}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
}
