import CONFIGURATIONS from "@/configurations/configurations";

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const expiryOfOTP = (): Date => {
  // 10 minutes in milliseconds
  return new Date(
    Date.now() +
      parseInt(CONFIGURATIONS.APP.OTP_EXPIRY_TIME_IN_MINUTES) * 60 * 1000
  );
};
