export default function handler(req, res) {
  // Only allow in development or with special query parameter
  if (
    process.env.NODE_ENV === "production" &&
    req.query.secret !== "debug123"
  ) {
    return res.status(404).json({ error: "Not found" });
  }

  // Prevent repeated calls by checking if this is a HEAD request
  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,

    // Firebase Environment Variables
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      ? "✅ Loaded"
      : "❌ Missing",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env
      .NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      ? "✅ Loaded"
      : "❌ Missing",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ? "✅ Loaded"
      : "❌ Missing",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env
      .NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      ? "✅ Loaded"
      : "❌ Missing",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env
      .NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
      ? "✅ Loaded"
      : "❌ Missing",
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      ? "✅ Loaded"
      : "❌ Missing",

    // Google Drive Environment Variables
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
      ? "✅ Loaded"
      : "❌ Missing",
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: process.env
      .GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
      ? "✅ Loaded (length: " +
        process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.length +
        ")"
      : "❌ Missing",
    GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID
      ? "✅ Loaded"
      : "❌ Missing",

    // Deployment Information
    VERCEL: process.env.VERCEL ? "✅ Running on Vercel" : "❌ Not on Vercel",
    VERCEL_ENV: process.env.VERCEL_ENV || "Not set",
    VERCEL_URL: process.env.VERCEL_URL || "Not set",
  };

  // Check if all critical environment variables are present
  const criticalVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
    "GOOGLE_DRIVE_FOLDER_ID",
  ];

  const missingVars = criticalVars.filter((varName) => !process.env[varName]);
  const allConfigured = missingVars.length === 0;

  // Only log in development to reduce console spam
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Environment Variables Check:", envCheck);

    if (missingVars.length > 0) {
      console.log("❌ Missing critical environment variables:", missingVars);
    } else {
      console.log("✅ All critical environment variables are configured");
    }
  }

  res.status(200).json({
    environment: envCheck,
    status: allConfigured ? "✅ All configured" : "❌ Missing variables",
    missingVariables: missingVars,
    recommendations:
      missingVars.length > 0
        ? [
            "Add missing environment variables to your Vercel dashboard",
            "Ensure GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY includes proper line breaks",
            "Restart your deployment after adding variables",
          ]
        : [
            "All environment variables are properly configured",
            "System should be working correctly",
          ],
  });
}
