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
import { BlogArticleForm } from "@/components/forms/blog-article-form";
import { useSearchParams } from "next/navigation";
import "react-quill/dist/quill.snow.css";

export default function AddEditArticle() {
  const searchParams = useSearchParams();
  const blogId = searchParams?.get("id") || undefined;
  const isEdit = !!blogId;

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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={SUPER_ADMIN_ROUTES.BLOG_ALL_ARTICLES}>
                  All Articles
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {isEdit ? "Edit" : "Add"} Article
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-4xl font-bold">
          {isEdit ? "Edit" : "Add"} Article
        </h1>
        <BlogArticleForm blogId={blogId} />
      </div>
    </>
  );
}
