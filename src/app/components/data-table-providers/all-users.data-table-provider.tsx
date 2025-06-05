import React, { useCallback, useEffect, useRef, useState } from "react";
import { Search, Send, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { debounce } from "lodash";
import axios from "axios";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
import { UserRoleEnum } from "@/enums/user-role.enum";
import { formatRole } from "@/helpers/user-roles-naming.utils";
import { Input } from "@/components/ui/input";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { PaginationData } from "@/types/pagintion.types";
import { DataTableFacetedFilter } from "../data-table-components/data-table-faceted-filter";
import { DataTablePagination } from "../data-table-components/data-table-pagination";
import { TableSkeleton } from "../data-table-components/data-table-skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { InviteUserForm } from "../forms/invite-user-form";
import DefaultAvatarPlaceholder from "@/assets/default-user-avatar.png";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function AllUsersDataTableProvider() {
  const [sortByValueStr, setSortByValueStr] = useState<string>("createdAt");
  const [sortingOrder, setSortingOrder] = useState<"asc" | "desc">("asc");
  const [searchValueStr, setSearchValueStr] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const statusOptions = [
    {
      label: "Active",
      value: "active",
    },
    {
      label: "Inactive",
      value: "inactive",
    },
    {
      label: "Invitation",
      value: "invitation",
    },
  ];

  const [rolesFilters, setRolesFilters] = useState<string[]>([]);
  const rolesOptions = [
    {
      label: "Super Admin",
      value: "SUPER_ADMIN",
    },
    {
      label: "Tenant Admin",
      value: "TENANT_ADMIN",
    },
    {
      label: "User",
      value: "USER",
    },
  ];

  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isInviteFormOpen, setIsInviteFormOpen] = useState(false);

  const nameTemplate = (rowData: any) => {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 rounded-full">
          <AvatarImage
            src={`https://skybird-saas-boilerplate.s3.us-east-1.amazonaws.com/${rowData?.profileImage}`}
            alt={rowData?.firstName}
          />
          <AvatarFallback className="rounded-lg">
            {rowData?.firstName?.[0]}
            {rowData?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">
          {rowData.firstName} {rowData.lastName}
        </span>
      </div>
    );
  };

  const registerTypeTemplate = (rowData: any) => {
    const invitations = rowData.invitations;
    const type =
      invitations && invitations.length > 0 ? "Invitation" : "Portal Register";

    return (
      <div
        className={cn(
          "flex w-fit items-center rounded-md px-2 py-1 text-xs font-semibold",
          invitations && invitations.length > 0
            ? "bg-purple-100 text-purple-700"
            : "bg-blue-100 text-blue-700"
        )}
      >
        {type}
      </div>
    );
  };

  const activeStatusTemplate = (rowData: any) => {
    const isActive = rowData.isAccountActivate;
    return (
      <div
        className={cn(
          "flex w-fit items-center rounded-md px-2 py-1 text-xs font-semibold",
          isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
        )}
      >
        {isActive ? "Active" : "Inactive"}
      </div>
    );
  };

  const registerAtTemplate = (rowData: any) => {
    return (
      <p className="flex items-center gap-x-2 text-dark-300 text-sm+">
        {format(new Date(rowData.createdAt), "yyyy-MM-dd")}
      </p>
    );
  };

  const roleTypeTemplate = (rowData: any) => {
    return (
      <p className="flex items-center gap-x-2 text-dark-300 text-sm+">
        {rowData.roles.map(formatRole).join(", ")}
      </p>
    );
  };

  const actionTemplate = (rowData: any) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const [usersListData, setUsersListData] = useState<any>(null);
  const table = useReactTable({
    data: usersListData || [],
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

  const fetchCorporationList = async () => {
    setIsLoading(true);
    const params: Record<string, any> = {
      take: pagination.limit,
      page: pagination.page,
      searchValue: searchValueStr || undefined,
      statusFilterValue: statusFilters.length > 0 ? statusFilters : undefined,
      rolesFilterValue: rolesFilters.length > 0 ? rolesFilters : undefined,
      sortBy: sortByValueStr || undefined,
      order: sortByValueStr ? sortingOrder : undefined,
    };

    console.log("params", params);

    try {
      const response = await axios.get(`http://localhost:3000/api/user`, {
        params,
      });
      setUsersListData(response.data.items);
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
    fetchCorporationList();
  }, [
    pagination.page,
    pagination.limit,
    searchValueStr,
    sortByValueStr,
    sortingOrder,
    statusFilters,
    rolesFilters,
  ]);

  // Update search to use pagination
  const debouncedSearch = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValueStr(e.target.value);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300),
    []
  );

  // Handle the status filter change
  const handleOnStatusFilterChange = useCallback((values: string[]) => {
    setStatusFilters(values);
    console.log("values", values);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Handle the roles filter change
  const handleOnRolesFilterChange = useCallback((values: string[]) => {
    setRolesFilters(values);
    console.log("values", values);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Clear the status and roles filters
  const clearStatusFilters = () => {
    setStatusFilters([]);
    setRolesFilters([]);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSearchValueStr("");

    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  // Handle the sort change
  const handleSortChange = (field: string) => {
    if (sortByValueStr === field) {
      // Toggle sorting order if clicking on the same column
      setSortingOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      // Reset sorting order to "asc" when a new column is selected
      setSortingOrder("asc");
      setSortByValueStr(field);
    }
  };

  // Handle the invite user success
  const handleInviteUserSuccess = () => {
    fetchCorporationList();
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative">
            <Input
              ref={searchInputRef}
              placeholder="Search users..."
              className="h-9 w-[150px] lg:w-[250px]"
              onChange={debouncedSearch}
            />
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <DataTableFacetedFilter
            title="Status"
            options={statusOptions}
            selectedValues={statusFilters}
            onFilterChange={handleOnStatusFilterChange}
          />
          <DataTableFacetedFilter
            title="Role"
            options={rolesOptions}
            selectedValues={rolesFilters}
            onFilterChange={handleOnRolesFilterChange}
          />
          <Button
            variant="outline"
            onClick={clearStatusFilters}
            className="h-8 px-2 lg:px-3 text-slate-500 hover:text-slate-700"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <Sheet open={isInviteFormOpen} onOpenChange={setIsInviteFormOpen}>
          <SheetTrigger asChild>
            <Button variant="default" size="sm" className="h-9">
              <Send className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <InviteUserForm
              onClose={() => setIsInviteFormOpen(false)}
              onSuccess={handleInviteUserSuccess}
            />
          </SheetContent>
        </Sheet>
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
                    <TableHead className="py-4">Register Type</TableHead>
                    <TableHead className="py-4">Status</TableHead>
                    <TableHead
                      className="py-4 cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSortChange("createdAt")}
                    >
                      <div className="flex items-center gap-1">
                        Register At
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
                    <TableHead className="py-4">Roles</TableHead>
                    <TableHead className="py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(usersListData || []).map((rowData: any) => (
                    <TableRow key={rowData.id}>
                      <TableCell className="py-4 min-h-[64px]">
                        {nameTemplate(rowData)}
                      </TableCell>
                      <TableCell className="py-4 min-h-[64px]">
                        {rowData.email}
                      </TableCell>
                      <TableCell className="py-4 min-h-[64px]">
                        {registerTypeTemplate(rowData)}
                      </TableCell>
                      <TableCell className="py-4 min-h-[64px]">
                        {activeStatusTemplate(rowData)}
                      </TableCell>
                      <TableCell className="py-4 min-h-[64px]">
                        {registerAtTemplate(rowData)}
                      </TableCell>
                      <TableCell className="py-4 min-h-[64px]">
                        {roleTypeTemplate(rowData)}
                      </TableCell>
                      <TableCell className="py-4 min-h-[64px]">
                        {actionTemplate(rowData)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!usersListData?.length && (
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
    </div>
  );
}
