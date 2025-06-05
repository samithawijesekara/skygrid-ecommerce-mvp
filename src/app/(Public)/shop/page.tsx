import { ShopContent } from "@/components/shop/shop-content";

export default function ShopPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shop</h1>
        <p className="text-muted-foreground mt-2">
          Discover our complete collection
        </p>
      </div>
      <ShopContent />
    </div>
  );
}
