"use client";
import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
  Newspaper,
  Plus,
  Tag,
  Home,
  Rss,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { SUPER_ADMIN_ROUTES } from "@/constants/router.const";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: SUPER_ADMIN_ROUTES.DASHBOARD,
      icon: PieChart,
      isActive: false,
    },
    {
      title: "All Users",
      url: SUPER_ADMIN_ROUTES.USERS,
      icon: Users,
      isActive: false,
    },
    {
      title: "Blog",
      url: "",
      icon: Rss,
      items: [
        {
          title: "All Articles",
          url: SUPER_ADMIN_ROUTES.BLOG_ALL_ARTICLES,
          icon: Newspaper,
        },
        {
          title: "Add Article",
          url: SUPER_ADMIN_ROUTES.BLOG_ADD_ARTICLE,
          icon: Plus,
        },
        {
          title: "Categories",
          url: SUPER_ADMIN_ROUTES.BLOG_CATEGORIES,
          icon: Tag,
        },
      ],
    },
    {
      title: "Settings",
      url: SUPER_ADMIN_ROUTES.SETTINGS,
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
