import { google } from "googleapis";

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY =
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

let drive = null;

// Initialize Google Drive Service Account
try {
  if (GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    drive = google.drive({ version: "v3", auth });
    console.log("✅ Google Drive Service Account initialized for proxy");
  }
} catch (error) {
  console.error(
    "❌ Google Drive Service Account initialization failed:",
    error
  );
}

export default async function handler(req, res) {
  const { fileId } = req.query;

  if (!fileId) {
    return res.status(400).json({ error: "Missing file ID" });
  }

  // Debug environment variables in production
  console.log("🔍 Environment check:", {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: !!process.env.VERCEL,
    hasServiceAccountEmail: !!GOOGLE_SERVICE_ACCOUNT_EMAIL,
    hasServiceAccountKey: !!GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    serviceAccountEmailLength: GOOGLE_SERVICE_ACCOUNT_EMAIL?.length || 0,
    privateKeyLength: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.length || 0,
  });

  try {
    console.log("🌐 Proxying PDF from Google Drive:", fileId);

    if (!drive) {
      console.error("❌ Google Drive Service Account not initialized");
      console.error("❌ Environment variables:", {
        GOOGLE_SERVICE_ACCOUNT_EMAIL: !!GOOGLE_SERVICE_ACCOUNT_EMAIL,
        GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:
          !!GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      });
      return res.status(500).json({
        error: "Google Drive Service Account not configured",
        fileId,
        debug: {
          hasEmail: !!GOOGLE_SERVICE_ACCOUNT_EMAIL,
          hasKey: !!GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
          emailLength: GOOGLE_SERVICE_ACCOUNT_EMAIL?.length || 0,
          keyLength: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.length || 0,
        },
      });
    }

    // Get file content using Service Account
    const response = await drive.files.get({
      fileId: fileId,
      alt: "media",
    });

    if (!response.data) {
      console.log("❌ No file data received from Google Drive");
      return res.status(404).json({
        error: "Could not fetch PDF from Google Drive",
        fileId,
      });
    }

    console.log("✅ Successfully fetched PDF from Google Drive");

    // Handle different data types from Google Drive API
    let buffer;
    if (Buffer.isBuffer(response.data)) {
      buffer = response.data;
    } else if (response.data instanceof ArrayBuffer) {
      buffer = Buffer.from(response.data);
    } else if (
      response.data &&
      typeof response.data.arrayBuffer === "function"
    ) {
      // Handle Blob objects
      const arrayBuffer = await response.data.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (typeof response.data === "string") {
      buffer = Buffer.from(response.data, "binary");
    } else {
      // Try to convert any other type
      buffer = Buffer.from(response.data);
    }

    // Set appropriate headers for PDF serving (inline viewing)
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Content-Disposition", `inline; filename="document.pdf"`);
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    // Remove X-Frame-Options to allow iframe embedding
    res.setHeader("X-Content-Type-Options", "nosniff");

    console.log("✅ Serving PDF via proxy, size:", buffer.length);
    return res.send(buffer);
  } catch (error) {
    console.error("💥 Google Drive proxy error:", error);

    // Try fallback URLs if Service Account fails
    console.log("🔄 Falling back to public URL access");

    const publicUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    try {
      const response = await fetch(publicUrl);

      if (response.ok) {
        const pdfBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(pdfBuffer);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Length", buffer.length);
        res.setHeader("Content-Disposition", `inline; filename="document.pdf"`);
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        // Remove X-Frame-Options to allow iframe embedding
        res.setHeader("X-Content-Type-Options", "nosniff");

        console.log(
          "✅ Fallback successful, serving PDF, size:",
          buffer.length
        );
        return res.send(buffer);
      }
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError.message);
    }

    return res.status(500).json({
      error: "Failed to proxy PDF from Google Drive",
      details: error.message,
      fileId,
    });
  }
}
