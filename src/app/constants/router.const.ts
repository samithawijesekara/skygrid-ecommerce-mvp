/************************************************************ 
=============== Authentication Flow Routes ==================
************************************************************/
export const AUTH_ROUTES = {
  SIGN_UP: "/signup",
  LOG_IN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  OTP_VERIFICATION: "/otp-verification",
  INVITATION: "/signup/invitation",
  PORTAL_SWITCH: "/portal-switch",
  // Add here another routes...
} as const;

/************************************************************ 
================== Public Pages Routes =====================
************************************************************/
export const PUBLIC_ROUTES = {
  HOME: "/",
  PRIVACY_POLICY: "/privacy-policy",
  SUPPORT: "/support",
  TERMS_CONDITIONS: "/terms-conditions",
  BLOG: "/blog",
  UNAUTHORIZED: "/unauthorize",
  // Add here another routes...
} as const;

/************************************************************ 
================== Super Admin Routes =====================
************************************************************/
export const SUPER_ADMIN_ROUTES = {
  DASHBOARD: "/super-admin",
  SETTINGS: "/super-admin/settings",
  USERS: "/super-admin/users",
  BLOG: "/super-admin/blog",
  BLOG_ALL_ARTICLES: "/super-admin/blog/all",
  BLOG_ADD_ARTICLE: "/super-admin/blog/add",
  BLOG_CATEGORIES: "/super-admin/blog/categories",
  // Add here another routes...
} as const;

/************************************************************ 
================== Main Routes =====================
************************************************************/
export const MAIN_ROUTES = {
  DASHBOARD: "/portal",
  SETTINGS: "/portal/settings",
  // Add here another routes...
} as const;
