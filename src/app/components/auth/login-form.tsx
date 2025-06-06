"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff, Loader, Loader2 } from "lucide-react";
import {
  AUTH_ROUTES,
  MAIN_ROUTES,
  PUBLIC_ROUTES,
  SUPER_ADMIN_ROUTES,
} from "@/constants/router.const";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { getSession, signIn } from "next-auth/react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { UserRoleEnum } from "@/enums/user-role.enum";
import { usePasswordToggle } from "@/hooks/use-password-toggle";
import { Role } from "@prisma/client";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search parameters
  const { showPassword, togglePasswordVisibility } = usePasswordToggle();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogleSignIn, setIsLoadingGoogleSignIn] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      setIsLoading(true);

      const callback = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      setIsLoading(false);
      reset(); // Reset form fields

      console.log("callback : ", callback);

      if (callback?.ok) {
        toast.success("Login successful! Welcome back.");

        setTimeout(async () => {
          try {
            const session = await getSession(); // Fetch user session to get role

            const userRoles = session?.user?.roles as unknown as Role[];
            const callbackUrl =
              new URLSearchParams(window.location.search).get("callbackUrl") ||
              "";
            const callbackPath = callbackUrl
              ? new URL(callbackUrl, window.location.origin).pathname
              : "";

            // Handle multiple roles
            if (userRoles.length > 1) {
              router.push(AUTH_ROUTES.PORTAL_SWITCH);
            }
            // Handle single role scenarios
            else if (userRoles?.length === 1) {
              // For Super Admin
              if (userRoles.includes(UserRoleEnum.SUPER_ADMIN)) {
                if (callbackPath.startsWith(SUPER_ADMIN_ROUTES.DASHBOARD)) {
                  router.push(callbackPath);
                } else {
                  router.push(SUPER_ADMIN_ROUTES.DASHBOARD);
                }
              }
              // For Tenant Admin
              else if (userRoles.includes(UserRoleEnum.TENANT_ADMIN)) {
                if (
                  callbackPath &&
                  !callbackPath.startsWith(SUPER_ADMIN_ROUTES.DASHBOARD)
                ) {
                  router.push(callbackPath);
                } else {
                  router.push(MAIN_ROUTES.DASHBOARD);
                }
              }
              // For other single roles (default case)
              else {
                if (
                  callbackPath &&
                  !callbackPath.startsWith(SUPER_ADMIN_ROUTES.DASHBOARD)
                ) {
                  router.push(callbackPath);
                } else {
                  router.push(MAIN_ROUTES.DASHBOARD);
                }
              }
            }
            // Fallback for no roles (shouldn't typically happen)
            else {
              router.push(MAIN_ROUTES.DASHBOARD);
              toast.warning("No role assigned to user");
            }
          } catch (sessionError) {
            console.error("Error fetching session:", sessionError);
            toast.error("Failed to fetch user session.");
          }
        }, 1500);
      } else {
        // Handling the not verified email account redirection to the OTP verification page
        if (!callback?.ok && callback?.error) {
          if (callback.error.startsWith("EMAIL_NOT_VERIFIED:")) {
            const email = callback.error.split(":")[1]; // Extract email
            router.push(`/otp-verification?email=${encodeURIComponent(email)}`);
          } else {
            toast.error(callback?.error || "Login failed. Please try again.");
          }
          return;
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email address",
              },
            })}
            disabled={isLoading || isLoadingGoogleSignIn}
            className="pl-10"
          />
          {errors.email?.message && (
            <p className="text-red-500 text-sm">
              {typeof errors.email?.message === "string"
                ? errors.email?.message
                : "Invalid Email"}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password", {
              required: "Password is required",
            })}
            disabled={isLoading || isLoadingGoogleSignIn}
            className="pl-10 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={togglePasswordVisibility}
            disabled={isLoading || isLoadingGoogleSignIn}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="text-center">
        <Button variant="link" className="text-sm">
          Forgot your password?
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsLoadingGoogleSignIn(true);
            signIn("google").finally(() => setIsLoadingGoogleSignIn(false));
          }}
          disabled={isLoading || isLoadingGoogleSignIn}
        >
          {isLoadingGoogleSignIn ? (
            <>
              <Loader2 className="animate-spin" /> Please wait
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Login with Google
            </>
          )}
        </Button>
        <Button variant="outline" type="button">
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </Button>
      </div>
    </form>
  );
}
