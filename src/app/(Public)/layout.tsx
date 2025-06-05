"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/global.css";
import { Suspense, useEffect, useState } from "react";
import Spinner from "@/components/loading-spinners/spinner";
import CustomHead from "@/components/common/custom-head";
import NavbarPublic from "@/components/public/nav-bar-public";
import PublicLayout from "@/components/layouts/public-layout";
import Footer from "@/components/public/footer";
import { useRouter } from "next/navigation";
import { checkSessionRedirection } from "@/helpers/check-session-redirection.utils";
import { SessionProvider } from "next-auth/react";

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
            <PublicLayout>{children}</PublicLayout>
            <Footer />
          </SessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
