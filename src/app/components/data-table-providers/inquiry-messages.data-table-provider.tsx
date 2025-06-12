"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  ArrowUpDown,
  Eye,
  EyeOff,
  ArrowBigRight,
  Trash,
} from "lucide-react";
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
import { ContactFormMessage } from "@prisma/client";
import { ContactFormCategoryType } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";

type ContactFormMessageWithCategory = ContactFormMessage & {
  category: ContactFormCategoryType | null;
};

export default function InquiryMessagesDataTableProvider() {
  const [sortByValueStr, setSortByValueStr] = useState<string>("createdAt");
  const [sortingOrder, setSortingOrder] = useState<"asc" | "desc">("desc");
  const [searchValueStr, setSearchValueStr] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedMessage, setSelectedMessage] =
    useState<ContactFormMessageWithCategory | null>(null);

  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isMessageDetailsOpen, setIsMessageDetailsOpen] = useState(false);
  const [messagesListData, setMessagesListData] = useState<
    ContactFormMessageWithCategory[]
  >([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const table = useReactTable({
    data: messagesListData || [],
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

  const fetchMessagesList = async () => {
    setIsLoading(true);
    const params: Record<string, any> = {
      take: pagination.limit,
      page: pagination.page,
      searchValue: searchValueStr || undefined,
      sortBy: sortByValueStr || undefined,
      order: sortByValueStr ? sortingOrder : undefined,
    };

    try {
      const response = await axios.get(`/api/contact-form-message`, { params });
      setMessagesListData(response.data.items);
      setPagination({
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessagesList();
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

  const handleDeleteMessage = async (messageId: string) => {
    setMessageToDelete(messageId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      await axios.delete(`/api/contact-form-message/${messageToDelete}`);
      toast.success("Message deleted successfully");
      fetchMessagesList();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  };

  const handleViewMessage = (message: ContactFormMessageWithCategory) => {
    setSelectedMessage(message);
    setIsMessageDetailsOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMessages(messagesListData.map((message) => message.id));
    } else {
      setSelectedMessages([]);
    }
  };

  const handleSelectMessage = (messageId: string, checked: boolean) => {
    if (checked) {
      setSelectedMessages((prev) => [...prev, messageId]);
    } else {
      setSelectedMessages((prev) => prev.filter((id) => id !== messageId));
    }
  };

  const handleBulkMarkAsRead = async (isRead: boolean) => {
    if (selectedMessages.length === 0) return;

    setIsUpdating(true);
    try {
      await axios.put(`/api/contact-form-message`, {
        messageIds: selectedMessages,
        isRead,
      });

      toast.success(
        `Messages marked as ${isRead ? "read" : "unread"} successfully`
      );
      setSelectedMessages([]);
      fetchMessagesList();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to mark messages as ${isRead ? "read" : "unread"}`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAsRead = async (messageId: string, isRead: boolean) => {
    setIsUpdating(true);
    try {
      await axios.put(`/api/contact-form-message`, {
        messageIds: [messageId],
        isRead,
      });

      toast.success(
        `Message marked as ${isRead ? "read" : "unread"} successfully`
      );
      fetchMessagesList();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to mark message as ${isRead ? "read" : "unread"}`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative">
            <Input
              ref={searchInputRef}
              placeholder="Search messages..."
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
        {selectedMessages.length > 0 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkMarkAsRead(true)}
              disabled={isUpdating}
            >
              <Eye className="mr-2 h-4 w-4" />
              Mark as Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkMarkAsRead(false)}
              disabled={isUpdating}
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Mark as Unread
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMessages([])}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>
      {isLoading ? (
        <TableSkeleton columnCount={6} rowCount={5} isTableHeader={true} />
      ) : (
        <>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          selectedMessages.length === messagesListData.length
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
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
                    <TableHead
                      className="py-4 cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSortChange("email")}
                    >
                      <div className="flex items-center gap-1">
                        Email
                        {sortByValueStr === "email" ? (
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
                    <TableHead className="py-4">Subject</TableHead>
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
                  {(messagesListData || []).map(
                    (message: ContactFormMessageWithCategory) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedMessages.includes(message.id)}
                            onCheckedChange={(checked) =>
                              handleSelectMessage(
                                message.id,
                                checked as boolean
                              )
                            }
                            aria-label={`Select ${message.name}`}
                          />
                        </TableCell>
                        <TableCell className="py-4">{message.name}</TableCell>
                        <TableCell className="py-4">{message.email}</TableCell>
                        <TableCell className="py-4">
                          {message.subject || "No subject"}
                        </TableCell>
                        <TableCell className="py-4">
                          {format(
                            new Date(message.createdAt),
                            "yyyy-MM-dd HH:mm"
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant={message.isRead ? "secondary" : "default"}
                          >
                            {message.isRead ? "Read" : "Unread"}
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
                                onClick={() => handleViewMessage(message)}
                              >
                                <ArrowBigRight className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleMarkAsRead(message.id, !message.isRead)
                                }
                              >
                                {message.isRead ? (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Mark as Unread
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Mark as Read
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteMessage(message.id)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                  {!messagesListData?.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No messages found.
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
      <Sheet open={isMessageDetailsOpen} onOpenChange={setIsMessageDetailsOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedMessage && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Message Details</h2>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-sm text-gray-600">
                    {selectedMessage.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-gray-600">
                    {selectedMessage.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <p className="text-sm text-gray-600">
                    {selectedMessage.subject || "No subject"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <p className="text-sm text-gray-600">
                    {selectedMessage.category?.name || "Uncategorized"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Received At</label>
                  <p className="text-sm text-gray-600">
                    {format(new Date(selectedMessage.createdAt), "PPpp")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setMessageToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Message"
        description="Are you sure you want to delete this message? This action cannot be undone."
      />
    </div>
  );
}
