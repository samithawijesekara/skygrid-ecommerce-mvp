"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, ArrowUpDown, Eye, EyeOff } from "lucide-react";
import { debounce } from "lodash";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Cross2Icon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { PaginationData } from "@/types/pagintion.types";
import { DataTablePagination } from "@/components/data-table-components/data-table-pagination";
import { TableSkeleton } from "@/components/data-table-components/data-table-skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { ProductForm } from "@/components/forms/product-form";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function ProductsPageComponent() {
  const router = useRouter();
  const [sortByValueStr, setSortByValueStr] = useState<string>("createdAt");
  const [sortingOrder, setSortingOrder] = useState<"asc" | "desc">("asc");
  const [searchValueStr, setSearchValueStr] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productsListData, setProductsListData] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const table = useReactTable({
    data: productsListData || [],
    columns: [],
    getCoreRowModel: getCoreRowModel(),
    pageCount: pagination?.totalPages ?? -1,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
    manualPagination: true,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPagination = updater({
          pageIndex: pagination.page - 1,
          pageSize: pagination.limit,
        });
        setPagination((prev) => ({
          ...prev,
          page: newPagination.pageIndex + 1,
          limit: newPagination.pageSize,
        }));
      }
    },
  });

  const fetchProductsList = async () => {
    setIsLoading(true);
    const params: Record<string, any> = {
      take: pagination.limit,
      page: pagination.page,
      searchValue: searchValueStr || undefined,
      sortBy: sortByValueStr || undefined,
      order: sortByValueStr ? sortingOrder : undefined,
      isAdmin: true, // Always fetch all products in admin view
    };

    try {
      const response = await axios.get(`/api/product`, { params });
      setProductsListData(response.data.items);
      setPagination({
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, [
    pagination.page,
    pagination.limit,
    searchValueStr,
    sortByValueStr,
    sortingOrder,
  ]);

  const debouncedSearch = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValueStr(e.target.value);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300),
    []
  );

  const clearFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSearchValueStr("");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  const handleSortChange = (field: string) => {
    if (sortByValueStr === field) {
      setSortingOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortingOrder("asc");
      setSortByValueStr(field);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await axios.delete(`/api/product/${productToDelete}`);
      toast.success("Product deleted successfully");
      fetchProductsList();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
    // Cleanup will be handled by onOpenChange
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsProductFormOpen(true);
  };

  const handleAddNewProduct = () => {
    setSelectedProduct(null);
    setIsProductFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsProductFormOpen(false);
    setSelectedProduct(null);
    fetchProductsList();
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/super-admin/products/${productId}`);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative">
            <Input
              ref={searchInputRef}
              placeholder="Search products..."
              className="h-9 w-[150px] lg:w-[250px]"
              onChange={debouncedSearch}
            />
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="h-8 px-2 lg:px-3 text-slate-500 hover:text-slate-700"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <Sheet open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
          <SheetTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="h-9"
              onClick={handleAddNewProduct}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[600px]">
            <ProductForm
              product={selectedProduct}
              onClose={() => setIsProductFormOpen(false)}
              onSuccess={handleFormSuccess}
            />
          </SheetContent>
        </Sheet>
      </div>
      {isLoading ? (
        <TableSkeleton columnCount={5} rowCount={5} isTableHeader={true} />
      ) : (
        <>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-4">Image</TableHead>
                    <TableHead
                      className="py-4 cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSortChange("title")}
                    >
                      <div className="flex items-center gap-1">
                        Title
                        {sortByValueStr === "title" ? (
                          sortingOrder === "asc" ? (
                            "↑"
                          ) : (
                            "↓"
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="py-4">Categories</TableHead>
                    <TableHead
                      className="py-4 cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSortChange("createdAt")}
                    >
                      <div className="flex items-center gap-1">
                        Created At
                        {sortByValueStr === "createdAt" ? (
                          sortingOrder === "asc" ? (
                            "↑"
                          ) : (
                            "↓"
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="py-4">Status</TableHead>
                    <TableHead className="py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(productsListData || []).map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="py-4">
                        <div className="relative h-12 w-12">
                          {product.coverImage ? (
                            <Image
                              src={product.coverImage}
                              alt={product.title}
                              fill
                              className="object-cover rounded-md"
                            />
                          ) : (
                            <div className="h-full w-full rounded-md bg-slate-100 flex items-center justify-center">
                              <svg
                                className="h-6 w-6 text-slate-400"
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
                      </TableCell>
                      <TableCell className="py-4 font-medium">
                        {product.title}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {product.categories?.map((cat: any) => (
                            <Badge key={cat.category.id} variant="outline">
                              {cat.category.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {format(new Date(product.createdAt), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant={
                            product.isPublished ? "default" : "secondary"
                          }
                        >
                          {product.isPublished ? (
                            <Eye className="h-4 w-4 mr-1" />
                          ) : (
                            <EyeOff className="h-4 w-4 mr-1" />
                          )}
                          {product.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 data-[state=open]:bg-muted"
                            >
                              <DotsHorizontalIcon className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[160px]"
                          >
                            <DropdownMenuItem
                              onClick={() => handleViewProduct(product.id)}
                            >
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditProduct(product)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!productsListData?.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DataTablePagination
            table={table}
            paginationData={pagination}
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, page }))
            }
          />
        </>
      )}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setProductToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
}
