import React, { Suspense } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SUPER_ADMIN_ROUTES } from "@/constants/router.const";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Mail, FileText, Tag, Activity } from "lucide-react";
import { AnalyticsPageComponent } from "@/components/super-admin/pages/analytics-page.component";
import { ProductCategoriesPageComponent } from "@/components/super-admin/pages/product-categories-page.component";

export default function ProductCategoriesPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={SUPER_ADMIN_ROUTES.DASHBOARD}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-4xl font-bold">Product Categories Overview</h1>
        <Suspense fallback={<div>Loading metrics...</div>}>
          <ProductCategoriesPageComponent />
        </Suspense>
      </div>
    </>
  );
}
