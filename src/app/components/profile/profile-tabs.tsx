"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "./general-settings";
import { OrderHistory } from "./order-history";
import { ShippingDetails } from "./shipping-details";
import { Favorites } from "./favorites";

const TAB_MAP = {
  orders: "orders",
  shipping: "shipping",
  favorites: "favourites",
  general: "settings",
};

const REVERSE_TAB_MAP = {
  orders: "orders",
  shipping: "shipping",
  favourites: "favorites",
  settings: "general",
};

export function ProfileTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get tab from URL, default to "orders"
  const urlTab = searchParams!.get("tab") || "orders";
  // Map URL param to TabsTrigger value
  const tabValue =
    REVERSE_TAB_MAP[urlTab as keyof typeof REVERSE_TAB_MAP] || "orders";

  const handleTabChange = (value: string) => {
    // Map TabsTrigger value to URL param
    const urlTabValue = TAB_MAP[value as keyof typeof TAB_MAP] || "orders";
    router.replace(`?tab=${urlTabValue}`);
  };

  return (
    <Tabs
      value={tabValue}
      onValueChange={handleTabChange}
      className="space-y-6"
    >
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="shipping">Shipping</TabsTrigger>
        <TabsTrigger value="favorites">Favorites</TabsTrigger>
        <TabsTrigger value="general">General</TabsTrigger>
      </TabsList>

      <TabsContent value="orders">
        <OrderHistory />
      </TabsContent>
      <TabsContent value="shipping">
        <ShippingDetails />
      </TabsContent>
      <TabsContent value="favorites">
        <Favorites />
      </TabsContent>
      <TabsContent value="general">
        <GeneralSettings />
      </TabsContent>
    </Tabs>
  );
}
