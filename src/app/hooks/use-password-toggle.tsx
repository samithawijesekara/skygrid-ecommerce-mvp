import { useState } from "react";

// Custom hook to manage password visibility toggle for multiple fields
export function usePasswordToggle() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<
    boolean | null
  >(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState<
    boolean | null
  >(null);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => (prev === null ? true : !prev));
  };

  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword((prev) => (prev === null ? true : !prev));
  };

  return {
    showPassword,
    showConfirmPassword,
    showCurrentPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    toggleCurrentPasswordVisibility,
  };
}
