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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SUPER_ADMIN_ROUTES } from "@/constants/router.const";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ImageIcon } from "@radix-ui/react-icons";

export default function AllBlogsDataTableProvider() {
  const [sortByValueStr, setSortByValueStr] = useState<string>("createdAt");
  const [sortingOrder, setSortingOrder] = useState<"asc" | "desc">("desc");
  const [searchValueStr, setSearchValueStr] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);
  const [blogsListData, setBlogsListData] = useState<any>(null);

  const table = useReactTable({
    data: blogsListData || [],
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

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/category", {
        params: { take: 100, page: 1 },
      });
      setCategories(response.data.items);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBlogsList = async () => {
    setIsLoading(true);
    const params: Record<string, any> = {
      take: pagination.limit,
      page: pagination.page,
      searchValue: searchValueStr || undefined,
      sortBy: sortByValueStr || undefined,
      order: sortByValueStr ? sortingOrder : undefined,
      categoryId: selectedCategoryId || undefined,
      isAdmin: "true",
    };

    try {
      const response = await axios.get(`/api/blog`, { params });
      console.log(response.data);
      setBlogsListData(response.data.items);
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
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogsList();
  }, [
    pagination.page,
    pagination.limit,
    searchValueStr,
    sortByValueStr,
    sortingOrder,
    selectedCategoryId,
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
    setSelectedCategoryId("");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  const handleSortChange = (field: string) => {
    if (sortByValueStr === field) {
      setSortingOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortingOrder("desc");
      setSortByValueStr(field);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    try {
      await axios.delete(`/api/blog/${blogId}`);
      toast.success("Blog deleted successfully");
      fetchBlogsList();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete blog");
    }
  };

  const handleEditBlog = (blog: any) => {
    router.push(`${SUPER_ADMIN_ROUTES.BLOG_ADD_ARTICLE}?id=${blog.id}`);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative">
            <Input
              ref={searchInputRef}
              placeholder="Search blogs..."
              className="h-9 w-[150px] lg:w-[250px]"
              onChange={debouncedSearch}
            />
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <Select
            value={selectedCategoryId}
            onValueChange={setSelectedCategoryId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="h-8 px-2 lg:px-3 text-slate-500 hover:text-slate-700"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="default"
          size="sm"
          className="h-9"
          onClick={() => router.push(SUPER_ADMIN_ROUTES.BLOG_ADD_ARTICLE)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Article
        </Button>
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
                    <TableHead className="w-[100px]">Cover</TableHead>
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
                    <TableHead className="py-4">Author</TableHead>
                    <TableHead className="py-4">Status</TableHead>
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
                  {(blogsListData || []).map((blog: any) => (
                    <TableRow key={blog.id}>
                      <TableCell className="py-2">
                        {blog.coverImage ? (
                          <div className="relative w-[60px] h-[40px]">
                            <Image
                              src={`https://skybird-saas-boilerplate.s3.us-east-1.amazonaws.com/${blog.coverImage}`}
                              alt={blog.title}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        ) : (
                          <div className="w-[60px] h-[40px] bg-slate-100 rounded-md flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        {blog.title.length > 50
                          ? `${blog.title.slice(0, 50)}...`
                          : blog.title}
                      </TableCell>
                      <TableCell className="py-4">
                        {blog.categories
                          .map((cat: any) => cat.category.name)
                          .join(", ")}
                      </TableCell>
                      <TableCell className="py-4">
                        {`${blog.createdBy.firstName} ${blog.createdBy.lastName}`}
                      </TableCell>
                      <TableCell className="py-4">
                        <div
                          className={cn(
                            "flex w-fit items-center rounded-md px-2 py-1 text-xs font-semibold",
                            blog.isPublished
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          )}
                        >
                          {blog.isPublished ? "Published" : "Draft"}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {format(new Date(blog.createdAt), "yyyy-MM-dd")}
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
                              onClick={() => handleEditBlog(blog)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteBlog(blog.id)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!blogsListData?.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
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
    </div>
  );
}
