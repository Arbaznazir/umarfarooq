// API route to check environment variables (for debugging only)
export default function handler(req, res) {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
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
  };

  // Also check what environment variables are actually available
  const firebaseEnvVars = Object.keys(process.env).filter((key) =>
    key.startsWith("NEXT_PUBLIC_FIREBASE")
  );

  res.status(200).json({
    message: "Environment Variables Check",
    envVars,
    availableFirebaseVars: firebaseEnvVars,
    totalEnvVars: Object.keys(process.env).length,
  });
}
