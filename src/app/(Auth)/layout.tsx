"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/global.css";
import { Suspense, useEffect, useState } from "react";
import Spinner from "../components/loading-spinners/spinner";
import AuthLayout from "../components/layouts/auth-layout";
import CustomHead from "@/components/common/custom-head";
import NavbarPublic from "@/components/public/nav-bar-public";
import { getSession, SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRoleEnum } from "@/enums/user-role.enum";
import { MAIN_ROUTES, SUPER_ADMIN_ROUTES } from "@/constants/router.const";
import { checkSessionRedirection } from "@/helpers/check-session-redirection.utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Checking the session redirection
  useEffect(() => {
    checkSessionRedirection(router, setIsLoading);
  }, [router]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <html lang="en">
      <CustomHead />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={<Spinner />}>
          <SessionProvider>
            <NavbarPublic />
            <AuthLayout>{children}</AuthLayout>
          </SessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
