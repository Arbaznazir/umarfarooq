import fs from "fs";
import path from "path";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { getGoogleDriveFileInfo } from "../../../lib/gdrive";
import { db } from "../../../lib/firebase";

export default async function handler(req, res) {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: "Filename is required" });
  }

  // Decode the filename in case it has spaces or special characters
  const decodedFilename = decodeURIComponent(filename);

  // Also create a sanitized version (spaces replaced with underscores)
  const sanitizedFilename = decodedFilename.replace(/[^a-zA-Z0-9.-]/g, "_");

  console.log("🔍 Serving PDF:", {
    original: filename,
    decoded: decodedFilename,
    sanitized: sanitizedFilename,
  });

  try {
    // Enhanced environment detection
    const isVercel =
      process.env.VERCEL || process.env.VERCEL_ENV || process.env.NOW_REGION;

    console.log("🌍 Environment check:", {
      isVercel: !!isVercel,
      filename: decodedFilename,
    });

    // STEP 1: Check database for Google Drive file ID
    console.log("🔍 Querying database for PDF with Google Drive info");

    const postsQuery = query(
      collection(db, "posts"),
      where("pdfAttachment.filename", "==", decodedFilename)
    );

    const snapshot = await getDocs(postsQuery);

    if (!snapshot.empty) {
      const postDoc = snapshot.docs[0];
      const postData = postDoc.data();
      const pdfAttachment = postData.pdfAttachment;

      console.log(
        "✅ Found PDF with filename:",
        pdfAttachment?.filename
          ? { stringValue: pdfAttachment.filename }
          : "No filename"
      );

      if (pdfAttachment) {
        console.log("📄 PDF attachment found:", {
          hasContent: !!pdfAttachment.content,
          contentLength: pdfAttachment.content
            ? pdfAttachment.content.length
            : 0,
          size: pdfAttachment.size,
          originalName: pdfAttachment.originalName,
          storageType: pdfAttachment.storageType,
          hasDriveFileId: !!pdfAttachment.driveFileId,
          hasDrivePublicUrl: !!pdfAttachment.drivePublicUrl,
        });

        // STEP 2: Try Google Drive URL first (if available)
        if (pdfAttachment.driveFileId || pdfAttachment.drivePublicUrl) {
          try {
            if (pdfAttachment.drivePublicUrl) {
              console.log(
                "🔗 Redirecting to Google Drive URL:",
                pdfAttachment.drivePublicUrl
              );
              return res.redirect(302, pdfAttachment.drivePublicUrl);
            } else if (pdfAttachment.driveFileId) {
              console.log(
                "☁️ Getting Google Drive file info:",
                pdfAttachment.driveFileId
              );
              const driveInfo = await getGoogleDriveFileInfo(
                pdfAttachment.driveFileId
              );
              console.log(
                "🔗 Redirecting to Google Drive:",
                driveInfo.publicUrl
              );
              return res.redirect(302, driveInfo.publicUrl);
            }
          } catch (driveError) {
            console.log(
              "⚠️ Google Drive access failed, trying fallbacks...",
              driveError.message
            );
          }
        }

        // STEP 3: Serve from database content (legacy fallback)
        if (pdfAttachment.content) {
          console.log("📄 Serving from database content");

          let pdfBuffer;

          if (
            pdfAttachment.isBase64 ||
            typeof pdfAttachment.content === "string"
          ) {
            pdfBuffer = Buffer.from(pdfAttachment.content, "base64");
          } else {
            pdfBuffer = Buffer.from(pdfAttachment.content);
          }

          const contentLength = pdfBuffer.length;

          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", "inline");
          res.setHeader("Content-Length", contentLength.toString());
          res.setHeader("Cache-Control", "public, max-age=31536000");
          res.setHeader("X-Content-Type-Options", "nosniff");
          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("X-Served-From", "database-content");
          res.setHeader(
            "X-Storage-Type",
            pdfAttachment.storageType || "unknown"
          );

          return res.send(pdfBuffer);
        }

        // STEP 4: Handle separate content document (legacy)
        if (pdfAttachment.contentDocId) {
          console.log(
            "📄 Loading from separate content document:",
            pdfAttachment.contentDocId
          );

          try {
            const contentDoc = await getDoc(
              doc(db, "pdf_contents", pdfAttachment.contentDocId)
            );

            if (contentDoc.exists()) {
              const contentData = contentDoc.data();

              if (contentData.content) {
                const pdfBuffer = Buffer.from(contentData.content, "base64");
                const contentLength = pdfBuffer.length;

                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", "inline");
                res.setHeader("Content-Length", contentLength.toString());
                res.setHeader("Cache-Control", "public, max-age=31536000");
                res.setHeader("X-Content-Type-Options", "nosniff");
                res.setHeader("Accept-Ranges", "bytes");
                res.setHeader("X-Served-From", "separate-document");

                return res.send(pdfBuffer);
              }
            }
          } catch (error) {
            console.error(
              "❌ Failed to load separate content document:",
              error
            );
          }
        }
      }
    }

    // STEP 5: Check local file system (for development)
    if (!isVercel) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "pdfs");

      console.log(
        "📁 Checking local file:",
        path.join(uploadsDir, decodedFilename)
      );

      try {
        if (fs.existsSync(uploadsDir)) {
          const files = fs.readdirSync(uploadsDir);

          // Try exact filename match first
          const exactMatch = files.find(
            (file) => file === decodedFilename || file === sanitizedFilename
          );

          if (exactMatch) {
            const localPath = path.join(uploadsDir, exactMatch);
            console.log(`✅ Found local file: ${exactMatch}`);

            const stats = fs.statSync(localPath);
            const fileBuffer = fs.readFileSync(localPath);

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "inline");
            res.setHeader("Content-Length", stats.size.toString());
            res.setHeader("Cache-Control", "public, max-age=31536000");
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("Accept-Ranges", "bytes");
            res.setHeader("X-Served-From", "local-file");

            return res.send(fileBuffer);
          }

          // Fallback: try partial name matching (for Ikrimah files)
          const partialMatch = files.find(
            (file) =>
              file.includes("Ikrimah") &&
              file.endsWith(".pdf") &&
              (decodedFilename.includes("Ikrimah") ||
                sanitizedFilename.includes("Ikrimah"))
          );

          if (partialMatch) {
            const fallbackPath = path.join(uploadsDir, partialMatch);
            console.log(`✅ Serving from partial match: ${partialMatch}`);

            const stats = fs.statSync(fallbackPath);
            const fileBuffer = fs.readFileSync(fallbackPath);

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "inline");
            res.setHeader("Content-Length", stats.size.toString());
            res.setHeader("Cache-Control", "public, max-age=31536000");
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("Accept-Ranges", "bytes");
            res.setHeader("X-Served-From", "local-partial-match");

            return res.send(fileBuffer);
          }
        }
      } catch (localError) {
        console.log("📁 Local file check failed:", localError.message);
      }
    }

    // STEP 6: Final error response
    console.log("❌ All serving methods failed");

    if (isVercel) {
      return res.status(404).json({
        error: "PDF not available",
        message:
          "This PDF file is not available for download in production. Please contact the administrator to upload this file to Google Drive.",
        isProduction: true,
        filename: decodedFilename,
        suggestion:
          "Contact the administrator to upload this file to Google Drive (FREE storage)",
      });
    } else {
      return res.status(404).json({
        error: "PDF not available",
        message: "PDF content not found in any storage location",
        isProduction: false,
        filename: decodedFilename,
        checkedLocations: [
          "Google Drive",
          "Database content",
          "Separate documents",
          "Local files",
        ],
      });
    }
  } catch (error) {
    console.error("💥 Serve PDF error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to serve PDF",
      details: error.message,
    });
  }
}
