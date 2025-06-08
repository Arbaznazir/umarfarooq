// Application configuration
export const config = {
  app: {
    name:
      process.env.NEXT_PUBLIC_APP_NAME ||
      "Umar Farooq Al Madani - Islamic Studies",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    description:
      process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
      "Islamic Studies Website by Umar Farooq Al Madani",
  },

  // Environment settings
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",

  // Firebase settings
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },

  // Admin settings
  admin: {
    email: process.env.ADMIN_EMAIL,
  },

  // Analytics
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
  },

  // API settings
  api: {
    timeout: 10000, // 10 seconds
    retries: 3,
  },

  // UI settings
  ui: {
    postsPerPage: 6,
    featuredPostsLimit: 3,
    categoriesLimit: 10,
  },

  // SEO settings
  seo: {
    defaultTitle: "Umar Farooq Al Madani - Islamic Studies",
    titleTemplate: "%s | Umar Farooq Al Madani",
    defaultDescription:
      "Islamic Studies Website featuring Quranic interpretations, Hadith discussions, and Islamic teachings by Umar Farooq Al Madani",
    siteUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    defaultImage: "/images/og-image.jpg",
    twitterHandle: "@umarfarooq",
  },
};

// Validation function
export const validateConfig = () => {
  const requiredEnvVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  return true;
};

export default config;
