"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePasswordToggle } from "@/hooks/use-password-toggle";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/constants/router.const";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    showPassword,
    showConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  } = usePasswordToggle();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const token = searchParams?.get("token");
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      setIsLoading(true);
      await axios.put(
        "/api/auth/reset-password",
        {
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      reset();
      setIsSuccess(true);
    } catch (error: unknown) {
      setIsLoading(false);
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while resetting the password."
        );
      } else {
        toast.error("An unknown error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center max-w-md mx-auto mt-12">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-semibold">Password Reset Successful</h2>
        <p className="text-muted-foreground">
          Your password has been reset. You can now log in with your new
          password.
        </p>
        <Button
          className="w-full"
          onClick={() => router.push(`${PUBLIC_ROUTES.HOME}?login=true`)}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-md mx-auto mt-12"
    >
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold">Reset Password</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Enter your new password below to reset your account password.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">New Password</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            {...register("password", {
              required: "Password is required",
            })}
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute right-2 top-2 text-gray-400"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword", {
              required: "Password is required",
            })}
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute right-2 top-2 text-gray-400"
            onClick={toggleConfirmPasswordVisibility}
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.confirmPassword?.message && (
          <p className="text-red-500 text-sm">
            {typeof errors.confirmPassword?.message === "string"
              ? errors.confirmPassword?.message
              : "Invalid Password"}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
          </>
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  );
}
