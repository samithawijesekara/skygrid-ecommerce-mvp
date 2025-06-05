"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { AUTH_ROUTES } from "@/constants/router.const";

export default function Unauthorize() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <Card className="max-w-xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-slate-900">
            Unauthorized Access!
          </CardTitle>
          <CardDescription className="mt-8 text-md text-gray-600">
            {" "}
            {/* Increased margin-top */}
            You do not have permission to view this page. Please contact the
            administrator or log in to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => router.push(AUTH_ROUTES.LOG_IN)}
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
