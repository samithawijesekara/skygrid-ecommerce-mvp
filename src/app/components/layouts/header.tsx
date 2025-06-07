"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  Home,
  Grid3X3,
  Info,
  MessageCircle,
  Settings,
  LogOut,
  Heart,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartSlider } from "@/components/cart/cart-slider";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useCart } from "@/components/cart/cart-context";
import { useUser } from "src/store/useUser";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { PUBLIC_ROUTES } from "@/constants/router.const";
import { clearLocalStorage } from "@/helpers/storage.utils";
import { signOut } from "next-auth/react";

export function Header() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState("login");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const { user } = useUser();
  const router = useRouter();

  console.log("user", user);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                MS
              </span>
            </div>
            <span className="font-bold text-xl">Modern Store</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              href="/shop"
              className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Shop</span>
            </Link>
            <Link
              href="/categories"
              className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors"
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Categories</span>
            </Link>
            <Link
              href="/about"
              className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors"
            >
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Contact</span>
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search products..." className="pl-10" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="rounded-full w-8 h-8 object-cover"
                      />
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold w-8 h-8">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`${PUBLIC_ROUTES.PROFILE}?tab=orders`)
                    }
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" /> Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`${PUBLIC_ROUTES.PROFILE}?tab=shipping`)
                    }
                  >
                    <Truck className="mr-2 h-4 w-4" /> Shipping
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`${PUBLIC_ROUTES.PROFILE}?tab=favourites`)
                    }
                  >
                    <Heart className="mr-2 h-4 w-4" /> Favourites
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`${PUBLIC_ROUTES.PROFILE}?tab=settings`)
                    }
                  >
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      clearLocalStorage();
                      signOut({
                        callbackUrl: PUBLIC_ROUTES.HOME,
                      });
                    }}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <AuthDialog
                open={isAuthOpen}
                setOpen={setIsAuthOpen}
                defaultTab={defaultTab}
              >
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </AuthDialog>
            )}

            {/* Cart */}
            <CartSlider>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </CartSlider>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link
                    href="/"
                    className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                  <Link
                    href="/shop"
                    className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span>Shop</span>
                  </Link>
                  <Link
                    href="/categories"
                    className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    <Grid3X3 className="h-5 w-5" />
                    <span>Categories</span>
                  </Link>
                  <Link
                    href="/about"
                    className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    <Info className="h-5 w-5" />
                    <span>About</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Contact</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="lg:hidden py-4 border-t">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search products..." className="pl-10" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
