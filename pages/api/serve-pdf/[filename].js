import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { app } from "../../../lib/firebase";
import { promises as fs } from "fs";
import path from "path";

const db = getFirestore(app);

// Environment check helper
function debugEnvironment() {
  console.log("🔍 Debug: Environment variables check:");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log(
    "NEXT_PUBLIC_FIREBASE_API_KEY:",
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ Loaded" : "❌ Missing"
  );
  console.log(
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:",
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅ Loaded" : "❌ Missing"
  );
  console.log(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID:",
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ Loaded" : "❌ Missing"
  );

  if (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  ) {
    console.log("✅ All Firebase environment variables loaded successfully");
  } else {
    console.log("❌ Some Firebase environment variables are missing");
  }
}

export default async function handler(req, res) {
  debugEnvironment();

  const { filename } = req.query;

  // Enhanced URL decoding for better filename handling
  const decodedFilename = decodeURIComponent(filename);
  const sanitizedFilename = decodedFilename.replace(/[<>:"/\\|?*]/g, "_");

  console.log("🔍 Serving PDF:", {
    original: filename,
    decoded: decodedFilename,
    sanitized: sanitizedFilename,
  });

  try {
    const isVercel =
      process.env.VERCEL || process.env.VERCEL_ENV || process.env.NOW_REGION;

    console.log("🌍 Environment check:", {
      isVercel: !!isVercel,
      filename: sanitizedFilename,
    });

    // Step 1: Check database for Google Drive files FIRST
    console.log("🔍 Querying database for Google Drive PDF");
    try {
      const postsRef = collection(db, "posts");
      const q = query(
        postsRef,
        where("pdfAttachment.filename", "==", sanitizedFilename)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const pdfData = doc.data().pdfAttachment;

        console.log(
          "✅ Found PDF with filename:",
          doc.data().pdfAttachment?.filename
        );
        console.log("📄 PDF attachment found:", {
          hasContent: !!pdfData?.content,
          contentLength: pdfData?.content?.length || 0,
          size: pdfData?.size || 0,
          originalName: pdfData?.originalName,
          storageType: pdfData?.storageType,
          hasGoogleDriveId: !!pdfData?.driveFileId,
          hasGoogleDriveUrl: !!pdfData?.drivePublicUrl,
        });

        // Priority 1: Google Drive files
        if (pdfData?.driveFileId) {
          console.log(
            "🚀 Redirecting to Google Drive proxy:",
            pdfData.driveFileId
          );

          // Set headers to allow iframe embedding before redirect
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

          // Use our proxy endpoint for Google Drive files
          const proxyUrl = `/api/serve-gdrive-pdf/${pdfData.driveFileId}`;
          return res.redirect(302, proxyUrl);
        }

        // Priority 2: Base64 content (legacy files)
        if (pdfData?.content) {
          console.log("📄 Serving base64 content from database");
          const buffer = Buffer.from(pdfData.content, "base64");

          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Length", buffer.length);
          res.setHeader(
            "Content-Disposition",
            `inline; filename="${pdfData.originalName || sanitizedFilename}"`
          );
          res.setHeader("Cache-Control", "public, max-age=31536000");

          return res.send(buffer);
        }

        // Priority 3: Metadata-only files - try local fallback
        if (pdfData?.storageType === "metadata_only") {
          console.log("⚠️ PDF is metadata_only - trying local fallback");

          // Try partial filename match for metadata_only files
          const uploadsDir = path.join(
            process.cwd(),
            "public",
            "uploads",
            "pdfs"
          );

          try {
            const files = await fs.readdir(uploadsDir);
            const baseFilename = sanitizedFilename.replace(/^\d+_/, ""); // Remove timestamp prefix
            const matchingFile = files.find(
              (file) =>
                file.includes(baseFilename.replace(".pdf", "")) ||
                baseFilename.includes(
                  file.replace(".pdf", "").replace(/^\d+_/, "")
                )
            );

            if (matchingFile) {
              console.log(
                "✅ Serving metadata_only PDF from partial match:",
                matchingFile
              );
              const filePath = path.join(uploadsDir, matchingFile);
              const fileBuffer = await fs.readFile(filePath);

              res.setHeader("Content-Type", "application/pdf");
              res.setHeader("Content-Length", fileBuffer.length);
              res.setHeader(
                "Content-Disposition",
                `inline; filename="${pdfData.originalName || matchingFile}"`
              );
              res.setHeader("Cache-Control", "public, max-age=31536000");

              return res.send(fileBuffer);
            }
          } catch (error) {
            console.log("📁 Local fallback failed:", error.message);
          }
        }
      }
    } catch (error) {
      console.error("❌ Database query failed:", error);
    }

    // Step 2: Check for local files (development only)
    if (!isVercel) {
      console.log("📁 Checking local file for development");
      const localPath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "pdfs",
        sanitizedFilename
      );

      try {
        await fs.access(localPath);
        console.log("✅ Found local file:", localPath);

        const fileBuffer = await fs.readFile(localPath);
        const stats = await fs.stat(localPath);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Length", stats.size);
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${sanitizedFilename}"`
        );
        res.setHeader("Cache-Control", "public, max-age=31536000");

        return res.send(fileBuffer);
      } catch (error) {
        console.log("📁 Local file not found:", error.message);
      }
    }

    // Step 3: No file found anywhere
    console.log("❌ PDF not found in any location");
    res.status(404).json({
      error: "PDF file not found",
      filename: sanitizedFilename,
      searchLocations: [
        "Google Drive (via database)",
        "Base64 content (database)",
        "Metadata-only with local fallback",
        !isVercel ? "Local files (development)" : null,
      ].filter(Boolean),
    });
  } catch (error) {
    console.error("💥 Error serving PDF:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
