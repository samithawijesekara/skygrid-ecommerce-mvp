import { FunctionComponent, ReactNode, useEffect } from "react";
import Image from "next/image";
import ToastyProvider from "../loading-spinners/toasty-provider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/super-admin/app-sidebar";
import { useSession } from "next-auth/react";
import { useUser } from "src/store/useUser";
import axios from "axios";
import Spinner from "../loading-spinners/spinner";

interface SuperAdminLayoutProps {
  children?: ReactNode;
}

const SuperAdminLayout: FunctionComponent<SuperAdminLayoutProps> = ({
  children,
}) => {
  const { data: session, status } = useSession();
  const setUser = useUser((state) => state.setUser);

  useEffect(() => {
    const initializeUser = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const response = await axios.get(`/api/user/${session.user.id}`);
          if (response.status === 200) {
            setUser(response.data);
          }
        } catch (error) {
          console.error("Failed to initialize user:", error);
          setUser(null);
        }
      }
    };

    initializeUser();
  }, [session, status, setUser]);

  if (status === "loading") {
    return <Spinner />;
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="z-10">{children}</SidebarInset>
      </SidebarProvider>
      <ToastyProvider />
    </>
  );
};

export default SuperAdminLayout;
