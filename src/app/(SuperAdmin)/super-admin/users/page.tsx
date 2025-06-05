"use client";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SUPER_ADMIN_ROUTES } from "@/constants/router.const";
import AllUsersDataTableProvider from "@/components/data-table-providers/all-users.data-table-provider";
import { UsersMetrics } from "@/components/metrics/users-metrics";

export default function AllUsersPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={SUPER_ADMIN_ROUTES.DASHBOARD}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Users</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-4xl">All Users</h1>
        <div className="h-full flex-1 flex-col space-y-2 p-8 md:flex">
          <UsersMetrics />
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground mt-6">
              Here&apos;s a list of all the users!
            </p>
          </div>
          <AllUsersDataTableProvider />
        </div>
      </div>
    </>
  );
}
