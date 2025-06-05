import "dotenv/config";

// Ensure all required environment variables are present
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const getNumberEnv = (key: string, defaultValue?: number): number => {
  const value = process.env[key]
    ? parseInt(process.env[key] as string, 10)
    : defaultValue;
  if (isNaN(value as number)) {
    throw new Error(`Invalid number for environment variable: ${key}`);
  }
  return value as number;
};

// Configuration object
const CONFIGURATIONS = {
  APP: {
    NAME: getEnv("NAME", "My App"),
    DESCRIPTION: getEnv("DESCRIPTION", "Default description"),
    CLIENT_URL: getEnv("CLIENT_URL"),
    NEXTAUTH_SECRET: getEnv("NEXTAUTH_SECRET"),
    NEXTAUTH_URL: getEnv("NEXTAUTH_URL"),
    OTP_EXPIRY_TIME_IN_MINUTES: getEnv("OTP_EXPIRY_TIME_IN_MINUTES"),
  },

  ENVIRONMENT: {
    NODE_ENV: getEnv("NODE_ENV", "development"),
  },

  DATABASE: {
    URL: getEnv("DATABASE_URL"),
  },

  SOCIAL_LOGINS: {
    GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  },

  JWT: {
    SECRET: getEnv("JWT_SECRET"),
  },

  ENCRYPTION: {
    SECRET_KEY: getEnv("ENCRYPTION_SECRET_KEY"),
  },

  MAIL_SERVICE: {
    FROM_ADDRESS: getEnv("EMAIL_FROM_ADDRESS"),
    FROM_NAME: getEnv("EMAIL_FROM_NAME"),
    REPLY_TO_ADDRESS: getEnv("EMAIL_REPLY_TO_ADDRESS"),
    REPLY_TO_NAME: getEnv("EMAIL_REPLY_TO_NAME"),
    API_KEY: getEnv("EMAIL_API_KEY"),
  },

  BCRYPT: {
    PW_SALT: getNumberEnv("PW_SALT", 10),
  },

  S3: {
    BUCKET_NAME: getEnv("S3_BUCKET"),
    REGION: getEnv("S3_REGION"),
    ACCESS_KEY_ID: getEnv("S3_ACCESS_KEY_ID"),
    SECRET_ACCESS_KEY: getEnv("S3_SECRET_ACCESS_KEY"),
    BUCKET_URL: getEnv("S3_BUCKET_URL"),
  },

  LLM: {
    GEMINI_API_KEY: getEnv("GEMINI_API_KEY"),
  },
};

export default CONFIGURATIONS;
