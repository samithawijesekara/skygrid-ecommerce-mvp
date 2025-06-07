"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "src/store/useUser";
import axios from "axios";
import Spinner from "@/components/loading-spinners/spinner";

export function UserInitializer({ children }: { children: React.ReactNode }) {
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

  return <>{children}</>;
}
