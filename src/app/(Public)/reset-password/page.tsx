import React, { useEffect, useState } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { useRouter } from "next/navigation";
import { checkSessionRedirection } from "@/helpers/check-session-redirection.utils";
import Spinner from "@/components/loading-spinners/spinner";

export default function ResetPassword() {
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
      <ResetPasswordForm />
    </>
  );
}
