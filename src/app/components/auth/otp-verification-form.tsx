"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Controller,
  FieldValues,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import {
  AUTH_ROUTES,
  MAIN_ROUTES,
  PUBLIC_ROUTES,
} from "@/constants/router.const";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function OtpVerificationForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState<string>("");
  const [isResending, setIsResending] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      otp: "",
    },
  });

  const checkOtp = async () => {
    try {
      const encodedEmail = encodeURIComponent(email);
      const response = await axios.get(
        `/api/auth/check-otp?email=${encodedEmail}`
      );
      if (!response?.data?.hasOtp) {
        router.push(PUBLIC_ROUTES.UNAUTHORIZED);
      }
    } catch (error) {
      console.error("Error checking OTP:", error);
    }
  };

  useEffect(() => {
    if (email) {
      checkOtp();
    } else {
      router.push(PUBLIC_ROUTES.UNAUTHORIZED);
    }
  }, [email]);

  // Handle OTP verification
  const onSubmit = async () => {
    setIsLoading(true);
    try {
      if (!email) {
        toast.error("Email is missing!");
        return;
      }

      const response = await axios.post("/api/auth/otp-verify", {
        otp,
        email,
      });

      if (response?.statusText === "OK") {
        reset();
        toast.success("OTP Verification successful!");
        setTimeout(() => {
          if (response?.data) {
            router.push(`${PUBLIC_ROUTES.HOME}?login=true`);
          }
        }, 1000);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error occurred!");
      } else {
        toast.error("An unknown error occurred!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email is missing!");
      return;
    }

    setIsResending(true);
    try {
      const response = await axios.put("/api/auth/otp-resend", { email });

      if (response?.statusText === "OK") {
        toast.success("OTP has been resent to your email!");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to resend OTP!");
      } else {
        toast.error("An unknown error occurred!");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-4 max-w-md mx-auto mt-32", className)}
      {...props}
    >
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold">Verify Your OTP</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Enter the OTP sent to your email to continue
        </p>
      </div>
      <div className="flex justify-center gap-2">
        <div className="grid gap-2">
          <Controller
            control={control}
            name="otp"
            render={({ field }) => (
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  field.onChange(value);
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            )}
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" /> Please wait
          </>
        ) : (
          "Verify OTP"
        )}
      </Button>
      <div className="text-center text-sm">
        Didn&apos;t receive the code?{" "}
        <Button
          className="underline underline-offset-4"
          variant="link"
          disabled={isResending}
          onClick={handleResendOtp}
        >
          {isResending ? (
            <>
              <Loader2 className="animate-spin" /> Resending...
            </>
          ) : (
            "Resend OTP"
          )}
        </Button>
      </div>
    </form>
  );
}
