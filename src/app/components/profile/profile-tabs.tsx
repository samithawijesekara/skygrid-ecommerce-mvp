"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings } from "./general-settings"
import { OrderHistory } from "./order-history"
import { ShippingDetails } from "./shipping-details"
import { Favorites } from "./favorites"

export function ProfileTabs() {
  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="shipping">Shipping</TabsTrigger>
        <TabsTrigger value="favorites">Favorites</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralSettings />
      </TabsContent>

      <TabsContent value="orders">
        <OrderHistory />
      </TabsContent>

      <TabsContent value="shipping">
        <ShippingDetails />
      </TabsContent>

      <TabsContent value="favorites">
        <Favorites />
      </TabsContent>
    </Tabs>
  )
}
