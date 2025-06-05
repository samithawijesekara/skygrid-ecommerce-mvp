import { FunctionComponent, ReactNode } from "react";
import Image from "next/image";
import Logo from "../../../../public/favicon.png";
import ToastyProvider from "../loading-spinners/toasty-provider";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { PUBLIC_ROUTES } from "@/constants/router.const";

interface PublicLayoutProps {
  children?: ReactNode;
}

const PublicLayout: FunctionComponent<PublicLayoutProps> = ({ children }) => {
  return (
    <>
      <div className="flex min-h-screen flex-col items-center gap-6 bg-slate-50 p-6 md:p-10">
        {children}
      </div>
      <ToastyProvider />
    </>
  );
};

export default PublicLayout;
