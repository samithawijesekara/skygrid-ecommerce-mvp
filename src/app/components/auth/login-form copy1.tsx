"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AUTH_ROUTES,
  MAIN_ROUTES,
  PUBLIC_ROUTES,
  SUPER_ADMIN_ROUTES,
} from "@/constants/router.const";
import Link from "next/link";

import axios from "axios";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { getSession, signIn } from "next-auth/react";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { UserRoleEnum } from "@/enums/user-role.enum";
import { Eye, EyeOff, Loader, Loader2 } from "lucide-react";
import { usePasswordToggle } from "@/hooks/use-password-toggle";
import { Role } from "@prisma/client";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome Back</CardTitle>
          <CardDescription>Login to your Acme portal account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Invalid email address",
                      },
                    })}
                    disabled={isLoading || isLoadingGoogleSignIn}
                  />
                  {errors.email?.message && (
                    <p className="text-red-500 text-sm">
                      {typeof errors.email?.message === "string"
                        ? errors.email?.message
                        : "Invalid Email"}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href={AUTH_ROUTES.FORGOT_PASSWORD}
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="grid gap-2">
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...register("password", {
                          required: "Password is required",
                        })}
                        disabled={isLoading || isLoadingGoogleSignIn}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-gray-400"
                        onClick={togglePasswordVisibility}
                        disabled={isLoading || isLoadingGoogleSignIn}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {errors.password?.message && (
                      <p className="text-red-500 text-sm">
                        {typeof errors.password?.message === "string"
                          ? errors.password?.message
                          : "Invalid Password"}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || isLoadingGoogleSignIn}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" /> Please wait
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLoadingGoogleSignIn(true);
                    signIn("google").finally(() =>
                      setIsLoadingGoogleSignIn(false)
                    );
                  }}
                  disabled={isLoading || isLoadingGoogleSignIn}
                >
                  {isLoadingGoogleSignIn ? (
                    <>
                      <Loader2 className="animate-spin" /> Please wait
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Login with Google
                    </>
                  )}
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href={AUTH_ROUTES.SIGN_UP}
                  className="underline underline-offset-4"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our{" "}
        <Link href={PUBLIC_ROUTES.TERMS_CONDITIONS}>Terms of Service</Link> and{" "}
        <Link href={PUBLIC_ROUTES.PRIVACY_POLICY}>Privacy Policy</Link>.
      </div>
    </div>
  );
}
