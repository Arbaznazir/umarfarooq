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
import { db } from "../../../lib/firebase";

export default async function handler(req, res) {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: "Filename is required" });
  }

  // Decode the filename in case it has spaces or special characters
  const decodedFilename = decodeURIComponent(filename);

  // Also create a sanitized version (spaces replaced with underscores)
  // This matches the sanitization logic in upload-pdf.js
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

    // First try to serve from file system (local development)
    if (!isVercel) {
      // Try both the original and sanitized filenames
      const filePaths = [
        path.join(process.cwd(), "public", "uploads", "pdfs", decodedFilename),
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "pdfs",
          sanitizedFilename
        ),
      ];

      for (const filePath of filePaths) {
        console.log("📁 Checking local file:", filePath);

        if (fs.existsSync(filePath)) {
          console.log("✅ Serving from local file system");
          const fileBuffer = fs.readFileSync(filePath);

          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", "inline");
          res.setHeader("Cache-Control", "public, max-age=31536000");
          res.setHeader("X-Content-Type-Options", "nosniff");

          return res.send(fileBuffer);
        }
      }

      console.log(
        "❌ Local file not found with any filename variant, checking database"
      );
    }

    // For Vercel or if file not found locally, try to get from database
    console.log("🔍 Querying database for PDF with multiple filename variants");

    // Try multiple filename variants in database queries
    const queries = [
      query(
        collection(db, "posts"),
        where("pdfAttachment.filename", "==", decodedFilename)
      ),
      query(
        collection(db, "posts"),
        where("pdfAttachment.filename", "==", filename)
      ),
      query(
        collection(db, "posts"),
        where("pdfAttachment.filename", "==", sanitizedFilename)
      ),
    ];

    let snapshot = null;
    let searchedFilename = null;

    for (const q of queries) {
      snapshot = await getDocs(q);
      if (!snapshot.empty) {
        searchedFilename = q._query.filters[0].value;
        console.log("✅ Found PDF with filename:", searchedFilename);
        break;
      }
    }

    if (!snapshot || snapshot.empty) {
      console.log("❌ PDF not found in database with any filename variant");

      // Let's also try a broader search to see if there are any PDFs with similar names
      const allPDFsQuery = query(
        collection(db, "posts"),
        where("pdfAttachment", "!=", null)
      );
      const allPDFs = await getDocs(allPDFsQuery);
      const availableFilenames = allPDFs.docs
        .map((doc) => doc.data().pdfAttachment?.filename)
        .filter(Boolean);

      return res.status(404).json({
        error: "PDF file not found",
        details: `No post found with PDF filename: ${decodedFilename}`,
        searchedFilenames: [decodedFilename, filename, sanitizedFilename],
        availableFilenames: availableFilenames.slice(0, 10), // Show up to 10 available filenames
      });
    }

    const postDoc = snapshot.docs[0];
    const postData = postDoc.data();
    const pdfAttachment = postData.pdfAttachment;

    console.log("📄 PDF attachment found:", {
      hasContent: !!pdfAttachment?.content,
      contentLength: pdfAttachment?.content ? pdfAttachment.content.length : 0,
      isBase64: pdfAttachment?.isBase64,
      size: pdfAttachment?.size,
      originalName: pdfAttachment?.originalName,
      storageType: pdfAttachment?.storageType,
      hasContentDocId: !!pdfAttachment?.contentDocId,
      postId: postDoc.id,
      postTitle: postData.title,
    });

    if (!pdfAttachment) {
      console.log("❌ No pdfAttachment found in post");
      return res.status(404).json({
        error: "PDF attachment not found",
        details: "Post found but no PDF attachment data",
      });
    }

    // Check if this is a metadata_only PDF (large file that couldn't be stored)
    if (pdfAttachment.storageType === "metadata_only") {
      console.log("⚠️ PDF is metadata_only - content not stored due to size");
      return res.status(404).json({
        error: "PDF content not available",
        message:
          "This PDF file is too large to be stored in the database. Please try downloading it instead.",
        filename: decodedFilename,
        originalName: pdfAttachment.originalName || "Unknown",
        storageType: "metadata_only",
        size: pdfAttachment.size,
        isLargeFile: true,
        recommendations: [
          "Use the Download button to get the file",
          "Use the Full Screen option to view in a new tab",
          "Contact the administrator if the file is not accessible",
        ],
      });
    }

    let pdfContent = null;
    let contentSource = "none";

    // Try multiple methods to get PDF content

    // Method 1: Direct content (most common)
    if (pdfAttachment.content && typeof pdfAttachment.content === "string") {
      console.log("📝 Found direct content");
      pdfContent = pdfAttachment.content;
      contentSource = "direct";
    }

    // Method 2: Separate document storage
    else if (pdfAttachment.contentDocId) {
      console.log(
        "🔗 Attempting to retrieve from separate document:",
        pdfAttachment.contentDocId
      );
      try {
        const contentDoc = await getDoc(
          doc(db, "pdf_contents", pdfAttachment.contentDocId)
        );
        if (contentDoc.exists()) {
          const data = contentDoc.data();
          pdfContent = data.content;
          contentSource = "separate";
          console.log("✅ Content retrieved from separate document");
        } else {
          console.log("❌ Separate content document not found");
        }
      } catch (error) {
        console.error("❌ Error retrieving separate content:", error);
      }
    }

    console.log("📊 Content retrieval result:", {
      contentSource,
      hasContent: !!pdfContent,
      contentLength: pdfContent ? pdfContent.length : 0,
    });

    // Try to serve the content if available
    if (pdfContent && typeof pdfContent === "string" && pdfContent.length > 0) {
      console.log("📤 Attempting to serve PDF content");

      try {
        let fileBuffer;

        // Always try base64 decoding first (most PDFs are stored this way)
        try {
          fileBuffer = Buffer.from(pdfContent, "base64");
          console.log(
            "✅ Successfully decoded as base64, buffer size:",
            fileBuffer.length
          );

          // Validate it's a proper PDF by checking the header
          if (fileBuffer.length > 4) {
            const header = fileBuffer.toString("ascii", 0, 4);
            if (header === "%PDF") {
              console.log("✅ Valid PDF header detected");
            } else {
              console.log("⚠️ No PDF header found, but proceeding anyway");
              console.log("🔍 Header found:", header);
            }
          }
        } catch (base64Error) {
          console.log(
            "❌ Base64 decoding failed, trying as binary:",
            base64Error.message
          );
          fileBuffer = Buffer.from(pdfContent, "binary");
        }

        // Final validation
        if (fileBuffer.length === 0) {
          throw new Error("Empty buffer after all decoding attempts");
        }

        console.log("✅ Successfully prepared buffer for serving");

        // Set proper headers
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
        res.setHeader("Cache-Control", "public, max-age=31536000");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Length", fileBuffer.length.toString());
        res.setHeader("Accept-Ranges", "bytes");

        return res.send(fileBuffer);
      } catch (bufferError) {
        console.error("❌ Error processing PDF buffer:", bufferError);
        return res.status(500).json({
          error: "Error processing PDF content",
          details: bufferError.message,
          contentSource,
          contentLength: pdfContent ? pdfContent.length : 0,
        });
      }
    } else {
      // No content available
      console.log("❌ No valid PDF content found");
      return res.status(404).json({
        error: "PDF content not available",
        message: "PDF metadata found but content is not accessible.",
        filename: decodedFilename,
        originalName: pdfAttachment.originalName || "Unknown",
        storageType: pdfAttachment.storageType || "unknown",
        contentSource,
        isLargeFile: pdfAttachment.storageType === "metadata_only",
        recommendations:
          pdfAttachment.storageType === "metadata_only"
            ? [
                "This file was too large to store in the database",
                "Please use the Download button",
                "Or try the Full Screen option",
              ]
            : [
                "Try refreshing the page",
                "Use the Download button as an alternative",
                "Contact support if the issue persists",
              ],
        debug: {
          hasContent: !!pdfAttachment.content,
          hasContentDocId: !!pdfAttachment.contentDocId,
          isBase64: pdfAttachment.isBase64,
          contentType: typeof pdfAttachment.content,
          contentLength: pdfAttachment.content
            ? pdfAttachment.content.length
            : 0,
        },
      });
    }
  } catch (error) {
    console.error("💥 Error serving PDF:", error);
    res.status(500).json({
      error: "Error serving PDF file",
      details: error.message,
      filename: decodedFilename,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
