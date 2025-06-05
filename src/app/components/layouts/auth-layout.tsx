import { FunctionComponent, ReactNode } from "react";
import Image from "next/image";
import Logo from "../../../../public/favicon.png";
import ToastyProvider from "../loading-spinners/toasty-provider";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { PUBLIC_ROUTES } from "@/constants/router.const";

interface AuthLayoutProps {
  children?: ReactNode;
}

const AuthLayout: FunctionComponent<AuthLayoutProps> = ({ children }) => {
  return (
    <>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link
            href={PUBLIC_ROUTES.HOME}
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </Link>
          {children}
        </div>
      </div>
      <ToastyProvider />
    </>
  );
};

export default AuthLayout;
