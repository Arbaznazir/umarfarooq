export default function handler(req, res) {
  // Security check - only allow in development or with auth
  if (
    process.env.NODE_ENV === "production" &&
    req.query.secret !== "debug123"
  ) {
    return res.status(403).json({ error: "Access denied" });
  }

  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: !!process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,

    // Firebase vars
    FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,

    // Google Drive vars (CRITICAL FOR PDF FUNCTIONALITY)
    GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:
      !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    GOOGLE_DRIVE_FOLDER_ID: !!process.env.GOOGLE_DRIVE_FOLDER_ID,

    // If present, show partial values for verification
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "NOT_SET",
    privateKeyLength:
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.length || 0,
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || "NOT_SET",
  };

  return res.json(envCheck);
}
