"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PUBLIC_ROUTES } from "@/constants/router.const";

export default function Unauthorize() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto mt-32 flex flex-col items-center space-y-4 text-center">
      <h2 className="text-2xl font-semibold">Unauthorized Access!</h2>
      <p className="text-muted-foreground text-sm mt-1">
        You do not have permission to view this page. Please contact the administrator or log in to continue.
      </p>
      <Button
        variant="outline"
        className="w-full mt-4"
        onClick={() => router.push(PUBLIC_ROUTES.HOME)}
      >
        Go to Home
      </Button>
    </div>
  );
}
