"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/global.css";
import { Suspense, useEffect } from "react";
import Spinner from "@/components/loading-spinners/spinner";
import CustomHead from "@/components/common/custom-head";
import MainLayout from "@/components/layouts/main-layout";
import { SessionProvider, useSession } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <CustomHead />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <Suspense fallback={<Spinner />}>
            <MainLayout>{children}</MainLayout>
          </Suspense>
        </SessionProvider>
      </body>
    </html>
  );
}
