"use client";
import React from "react";
import { Button } from "./components/ui/button";
import Link from "next/link";
import NavbarPublic from "./components/public/nav-bar-public";

export default function NotFound404() {
  return (
    <>
      <NavbarPublic />
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-bold text-red-600">404</h1>
        <h2 className="text-2xl font-semibold mt-2">Page Not Found</h2>
        <p className="text-muted-foreground mt-2">
          Sorry, the page you are looking for does not exist.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Go Back Home</Link>
        </Button>
      </div>
    </>
  );
}
