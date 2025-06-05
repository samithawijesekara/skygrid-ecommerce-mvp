import { ArrowDownRight, Search, Star } from "lucide-react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="py-0">
      <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="mx-auto flex flex-col items-center text-center md:ml-auto lg:max-w-3xl lg:items-start lg:text-left">
          <h1 className="my-6 text-pretty text-4xl font-bold lg:text-6xl xl:text-7xl bg-gradient-to-r from-[#30d9a9] to-[#f5b84d] bg-clip-text text-transparent">
            Discover Sri Lanka's Best Cafés & Spaces
          </h1>
          <p className="mb-8 max-w-xl text-muted-foreground lg:text-xl">
            Explore cafes, coffee shops, and co-working spaces across beautiful
            island of Sri Lanka. From beach side brews to mountain hideaways.
          </p>
          <div className="mb-12 flex w-fit flex-col items-center gap-4 sm:flex-row">
            <span className="inline-flex items-center -space-x-4">
              <Avatar className="size-12 border-2 border-gradient-to-r from-[#30d9a9] to-[#f5b84d] bg-gradient-to-r from-[#30d9a9]/10 to-[#f5b84d]/10">
                <AvatarImage
                  src="https://shadcnblocks.com/images/block/avatar-1.webp"
                  alt="placeholder"
                />
              </Avatar>
              <Avatar className="size-12 border-2 border-gradient-to-r from-[#30d9a9] to-[#f5b84d] bg-gradient-to-r from-[#30d9a9]/10 to-[#f5b84d]/10">
                <AvatarImage
                  src="https://shadcnblocks.com/images/block/avatar-2.webp"
                  alt="placeholder"
                />
              </Avatar>
              <Avatar className="size-12 border-2 border-gradient-to-r from-[#30d9a9] to-[#f5b84d] bg-gradient-to-r from-[#30d9a9]/10 to-[#f5b84d]/10">
                <AvatarImage
                  src="https://shadcnblocks.com/images/block/avatar-3.webp"
                  alt="placeholder"
                />
              </Avatar>
              <Avatar className="size-12 border-2 border-gradient-to-r from-[#30d9a9] to-[#f5b84d] bg-gradient-to-r from-[#30d9a9]/10 to-[#f5b84d]/10">
                <AvatarImage
                  src="https://shadcnblocks.com/images/block/avatar-4.webp"
                  alt="placeholder"
                />
              </Avatar>
              <Avatar className="size-12 border-2 border-gradient-to-r from-[#30d9a9] to-[#f5b84d] bg-gradient-to-r from-[#30d9a9]/10 to-[#f5b84d]/10">
                <AvatarImage
                  src="https://shadcnblocks.com/images/block/avatar-5.webp"
                  alt="placeholder"
                />
              </Avatar>
            </span>
            <div>
              <div className="flex items-center gap-1">
                <Star className="size-5 fill-[#30d9a9] text-[#30d9a9]" />
                <Star className="size-5 fill-[#30d9a9] text-[#30d9a9]" />
                <Star className="size-5 fill-[#30d9a9] text-[#30d9a9]" />
                <Star className="size-5 fill-[#30d9a9] text-[#30d9a9]" />
                <Star className="size-5 fill-[#30d9a9] text-[#30d9a9]" />
                <span className="font-semibold bg-gradient-to-r from-[#30d9a9] to-[#f5b84d] bg-clip-text text-transparent">
                  5.0
                </span>
              </div>
              <p className="text-left font-medium text-muted-foreground">
                from 200+ reviews
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <Button
              size="lg"
              className="w-full text-base font-semibold sm:w-auto transition-all duration-300 bg-[#30d9a9] hover:bg-[#30d9a9]/90 text-white shadow-lg hover:shadow-[#30d9a9]/25"
            >
              <Search className="size-5 mr-2" /> Explore
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full text-base font-semibold sm:w-auto transition-all duration-300 border-2 border-[#f5b84d] bg-transparent hover:bg-[#f5b84d]/10 text-[#f5b84d] hover:text-[#f5b84d]"
            >
              Sign Up
              <ArrowDownRight className="ml-2 size-5" />
            </Button>
          </div>
        </div>
        <div className="flex bg-gradient-to-r from-[#30d9a9]/5 to-[#f5b84d]/5 rounded-lg overflow-hidden p-1">
          <Image
            src="/images/hero.png"
            alt="placeholder hero"
            className="max-h-[600px] w-full rounded-md object-cover lg:max-h-[800px]"
            width={100}
            height={100}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
