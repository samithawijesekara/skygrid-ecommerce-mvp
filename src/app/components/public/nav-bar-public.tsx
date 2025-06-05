import {
  Book,
  Menu,
  Sunset,
  Trees,
  Zap,
  Home,
  Search,
  Map,
  FileText,
  Users,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AUTH_ROUTES } from "@/constants/router.const";
import Image from "next/image";

const subMenuItemsOne = [
  {
    title: "Blog",
    description: "The latest industry news, updates, and info",
    icon: <Book className="size-5 shrink-0" />,
  },
  {
    title: "Compnay",
    description: "Our mission is to innovate and empower the world",
    icon: <Trees className="size-5 shrink-0" />,
  },
  {
    title: "Careers",
    description: "Browse job listing and discover our workspace",
    icon: <Sunset className="size-5 shrink-0" />,
  },
  {
    title: "Support",
    description:
      "Get in touch with our support team or visit our community forums",
    icon: <Zap className="size-5 shrink-0" />,
  },
];

const subMenuItemsTwo = [
  {
    title: "Help Center",
    description: "Get all the answers you need right here",
    icon: <Zap className="size-5 shrink-0" />,
  },
  {
    title: "Contact Us",
    description: "We are here to help you with any questions you have",
    icon: <Sunset className="size-5 shrink-0" />,
  },
  {
    title: "Status",
    description: "Check the current status of our services and APIs",
    icon: <Trees className="size-5 shrink-0" />,
  },
  {
    title: "Terms of Service",
    description: "Our terms and conditions for using our services",
    icon: <Book className="size-5 shrink-0" />,
  },
];

const NavbarPublic = () => {
  const router = useRouter();

  return (
    <section className="py-4 w-full">
      <div className="w-full px-6 lg:px-12">
        <nav className="hidden lg:flex w-full justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Image
                src="https://shadcnblocks.com/images/block/block-1.svg"
                className="w-8"
                alt="logo"
                width={100}
                height={100}
              />
              <span className="text-lg font-semibold bg-gradient-to-r from-[#30d9a9] to-[#f5b84d] bg-clip-text text-transparent">
                CafeTrail
              </span>
            </div>
            <div className="flex items-center">
              <Link
                className={cn(
                  "text-black hover:text-[#30d9a9] flex items-center gap-2 transition-colors",
                  navigationMenuTriggerStyle,
                  buttonVariants({
                    variant: "ghost",
                  })
                )}
                href="/"
              >
                <Home className="size-4" />
                Home
              </Link>
              <Link
                className={cn(
                  "text-black hover:text-[#30d9a9] flex items-center gap-2 transition-colors",
                  navigationMenuTriggerStyle,
                  buttonVariants({
                    variant: "ghost",
                  })
                )}
                href="/explore"
              >
                <Search className="size-4" />
                Explore
              </Link>
              <Link
                className={cn(
                  "text-black hover:text-[#30d9a9] flex items-center gap-2 transition-colors",
                  navigationMenuTriggerStyle,
                  buttonVariants({
                    variant: "ghost",
                  })
                )}
                href="/map"
              >
                <Map className="size-4" />
                Map
              </Link>
              <Link
                className={cn(
                  "text-black hover:text-[#30d9a9] flex items-center gap-2 transition-colors",
                  navigationMenuTriggerStyle,
                  buttonVariants({
                    variant: "ghost",
                  })
                )}
                href="/blog"
              >
                <FileText className="size-4" />
                Blog
              </Link>
              <Link
                className={cn(
                  "text-black hover:text-[#30d9a9] flex items-center gap-2 transition-colors",
                  navigationMenuTriggerStyle,
                  buttonVariants({
                    variant: "ghost",
                  })
                )}
                href="/our-story"
              >
                <Users className="size-4" />
                Our Story
              </Link>
              <Link
                className={cn(
                  "text-black hover:text-[#30d9a9] flex items-center gap-2 transition-colors",
                  navigationMenuTriggerStyle,
                  buttonVariants({
                    variant: "ghost",
                  })
                )}
                href="/contact"
              >
                <Mail className="size-4" />
                Contact
              </Link>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#f5b84d] text-[#f5b84d] hover:bg-[#f5b84d]/10 hover:text-[#f5b84d]"
              onClick={() => router.push(AUTH_ROUTES.LOG_IN)}
            >
              Log in
            </Button>
            <Button
              size="sm"
              className="bg-[#30d9a9] hover:bg-[#30d9a9]/90 text-white"
              onClick={() => router.push(AUTH_ROUTES.SIGN_UP)}
            >
              Sign up
            </Button>
          </div>
        </nav>
        {/* From here going the mobile navigation menu */}
        <div className="block lg:hidden px-10 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="https://shadcnblocks.com/images/block/block-1.svg"
                className="w-8"
                alt="logo"
                width={100}
                height={100}
              />
              <span className="text-lg font-semibold bg-gradient-to-r from-[#30d9a9] to-[#f5b84d] bg-clip-text text-transparent">
                CafeTrail
              </span>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <div className="flex items-center gap-2">
                      <Image
                        src="https://shadcnblocks.com/images/block/block-1.svg"
                        className="w-8"
                        alt="logo"
                        width={100}
                        height={100}
                      />
                      <span className="text-lg font-semibold bg-gradient-to-r from-[#30d9a9] to-[#f5b84d] bg-clip-text text-transparent">
                        CafeTrail
                      </span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="mb-6 mt-6 flex flex-col gap-4">
                  <Link href="/" className="font-semibold">
                    Home
                  </Link>
                  <Link href="/explore" className="font-semibold">
                    Explore
                  </Link>
                  <Link href="/map" className="font-semibold">
                    Map
                  </Link>
                  <Link href="/blog" className="font-semibold">
                    Blog
                  </Link>
                  <Link href="/our-story" className="font-semibold">
                    Our Story
                  </Link>
                  <Link href="/contact" className="font-semibold">
                    Contact
                  </Link>
                </div>
                <div className="border-t py-4">
                  <div className="grid grid-cols-2 justify-start">
                    <Link
                      className={cn(
                        buttonVariants({
                          variant: "ghost",
                        }),
                        "justify-start text-muted-foreground"
                      )}
                      href="#"
                    >
                      Press
                    </Link>
                    <Link
                      className={cn(
                        buttonVariants({
                          variant: "ghost",
                        }),
                        "justify-start text-muted-foreground"
                      )}
                      href="#"
                    >
                      Contact
                    </Link>
                    <Link
                      className={cn(
                        buttonVariants({
                          variant: "ghost",
                        }),
                        "justify-start text-muted-foreground"
                      )}
                      href="#"
                    >
                      Imprint
                    </Link>
                    <Link
                      className={cn(
                        buttonVariants({
                          variant: "ghost",
                        }),
                        "justify-start text-muted-foreground"
                      )}
                      href="#"
                    >
                      Sitemap
                    </Link>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="border-[#f5b84d] text-[#f5b84d] hover:bg-[#f5b84d]/10 hover:text-[#f5b84d]"
                    onClick={() => router.push(AUTH_ROUTES.LOG_IN)}
                  >
                    Log in
                  </Button>
                  <Button
                    className="bg-[#30d9a9] hover:bg-[#30d9a9]/90 text-white"
                    onClick={() => router.push(AUTH_ROUTES.SIGN_UP)}
                  >
                    Sign up
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NavbarPublic;
