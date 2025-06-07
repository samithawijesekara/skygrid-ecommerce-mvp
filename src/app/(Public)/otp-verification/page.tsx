import React, { useEffect, useState } from "react";
import { OtpVerificationForm } from "@/components/auth/otp-verification-form";
import { useRouter } from "next/navigation";
import { checkSessionRedirection } from "@/helpers/check-session-redirection.utils";
import Spinner from "@/components/loading-spinners/spinner";

export default function OtpVerification() {
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
    <>
      <OtpVerificationForm />
    </>
  );
}
