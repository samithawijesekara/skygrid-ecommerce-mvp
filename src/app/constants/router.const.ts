/************************************************************ 
=============== Authentication Flow Routes ==================
************************************************************/
export const AUTH_ROUTES = {
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
  SHOP: "/shop",
  CATEGORIES: "/categories",
  ABOUT: "/about",
  CONTACT: "/contact",
  PROFILE: "/profile",
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
  // E-commerce routes
  PRODUCTS: "/super-admin/products/all",
  PRODUCTS_ADD: "/super-admin/products/add",
  PRODUCT_CATEGORIES: "/super-admin/products/categories",
  ORDERS: "/super-admin/orders",
  REVENUE: "/super-admin/revenue",
  HOTSPOTS: "/super-admin/hotspots",
  ANALYTICS: "/super-admin/analytics",
  INQUIRY_MESSAGES: "/super-admin/inquiry-messages",
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
