// Environment variable checker utility
export function checkEnvironmentVariables() {
  const requiredVars = {
    // Firebase
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,

    // Google Drive
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID,
  };

  const missing = [];
  const present = [];

  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      missing.push(key);
    } else {
      present.push(key);
    }
  }

  return {
    allPresent: missing.length === 0,
    missing,
    present,
    isProduction: process.env.NODE_ENV === "production",
    isVercel: !!(process.env.VERCEL || process.env.VERCEL_ENV),
  };
}

// Log environment status once per session
let envStatusLogged = false;

export function logEnvironmentStatus() {
  if (envStatusLogged) return;

  const status = checkEnvironmentVariables();

  if (status.missing.length > 0) {
    console.error("❌ Missing environment variables:", status.missing);
    if (status.isProduction) {
      console.error(
        "🚨 Production deployment may fail without these variables"
      );
    }
  } else {
    console.log("✅ All required environment variables are present");
  }

  envStatusLogged = true;
  return status;
}
