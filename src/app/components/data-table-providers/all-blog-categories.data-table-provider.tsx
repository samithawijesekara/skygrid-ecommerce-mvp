"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Search, Plus, ArrowUpDown } from "lucide-react";
import { debounce } from "lodash";
import axios from "axios";
import { Button } from "../ui/button";
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
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Cross2Icon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { PaginationData } from "@/types/pagintion.types";
import { DataTablePagination } from "../data-table-components/data-table-pagination";
import { TableSkeleton } from "../data-table-components/data-table-skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "react-toastify";
import { DeleteConfirmDialog } from "../common/delete-confirm-dialog";
import { Badge } from "../ui/badge";
import { BlogCategoryForm } from "../forms/blog-category-form";

export default function AllBlogCategoriesDataTableProvider() {
  const [sortByValueStr, setSortByValueStr] = useState<string>("createdAt");
  const [sortingOrder, setSortingOrder] = useState<"asc" | "desc">("asc");
  const [searchValueStr, setSearchValueStr] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [categoriesListData, setCategoriesListData] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const table = useReactTable({
    data: categoriesListData || [],
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

  const fetchCategoriesList = async () => {
    setIsLoading(true);
    const params: Record<string, any> = {
      take: pagination.limit,
      page: pagination.page,
      searchValue: searchValueStr || undefined,
      sortBy: sortByValueStr || undefined,
      order: sortByValueStr ? sortingOrder : undefined,
    };

    try {
      const response = await axios.get(`/api/blog-category`, { params });
      setCategoriesListData(response.data.items);
      setPagination({
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList();
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

  const handleDeleteCategory = async (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await axios.delete(`/api/blog-category/${categoryToDelete}`);
      toast.success("Category deleted successfully");
      fetchCategoriesList();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
    // Cleanup will be handled by onOpenChange
  };

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleAddNewCategory = () => {
    setSelectedCategory(null);
    setIsCategoryFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCategoryFormOpen(false);
    setSelectedCategory(null);
    fetchCategoriesList();
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative">
            <Input
              ref={searchInputRef}
              placeholder="Search categories..."
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
        <Sheet open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
          <SheetTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="h-9"
              onClick={handleAddNewCategory}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <BlogCategoryForm
              category={selectedCategory}
              onClose={() => setIsCategoryFormOpen(false)}
              onSuccess={handleFormSuccess}
            />
          </SheetContent>
        </Sheet>
      </div>
      {isLoading ? (
        <TableSkeleton columnCount={4} rowCount={5} isTableHeader={true} />
      ) : (
        <>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="py-4 cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSortChange("name")}
                    >
                      <div className="flex items-center gap-1">
                        Name
                        {sortByValueStr === "name" ? (
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
                    <TableHead className="py-4">Description</TableHead>
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
                    <TableHead className="py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(categoriesListData || []).map((category: any) => (
                    <TableRow key={category.id}>
                      <TableCell className="py-4">
                        <Badge variant="outline">{category.name}</Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        {category.description?.length > 80
                          ? `${category.description.slice(0, 80)}...`
                          : category.description}
                      </TableCell>
                      <TableCell className="py-4">
                        {format(new Date(category.createdAt), "yyyy-MM-dd")}
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
                              onClick={() => handleEditCategory(category)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!categoriesListData?.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
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
            setCategoryToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
      />
    </div>
  );
}
