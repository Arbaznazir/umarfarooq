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

  console.log("🔍 Serving PDF:", filename);

  try {
    // Enhanced environment detection
    const isVercel =
      process.env.VERCEL || process.env.VERCEL_ENV || process.env.NOW_REGION;

    console.log("🌍 Environment check:", {
      isVercel: !!isVercel,
      filename,
    });

    // First try to serve from file system (local development)
    if (!isVercel) {
      const filePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "pdfs",
        filename
      );

      console.log("📁 Checking local file:", filePath);

      if (fs.existsSync(filePath)) {
        console.log("✅ Serving from local file system");
        const fileBuffer = fs.readFileSync(filePath);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
        res.setHeader("Cache-Control", "public, max-age=31536000");
        res.setHeader("X-Content-Type-Options", "nosniff");

        return res.send(fileBuffer);
      } else {
        console.log("❌ Local file not found, checking database");
      }
    }

    // For Vercel or if file not found locally, try to get from database
    console.log("🔍 Querying database for PDF:", filename);

    const postsQuery = query(
      collection(db, "posts"),
      where("pdfAttachment.filename", "==", filename)
    );

    const snapshot = await getDocs(postsQuery);

    if (snapshot.empty) {
      console.log("❌ PDF not found in database");
      return res.status(404).json({
        error: "PDF file not found",
        details: `No post found with PDF filename: ${filename}`,
      });
    }

    const postDoc = snapshot.docs[0];
    const pdfAttachment = postDoc.data().pdfAttachment;

    console.log("📄 PDF attachment found:", {
      hasContent: !!pdfAttachment?.content,
      contentLength: pdfAttachment?.content ? pdfAttachment.content.length : 0,
      isBase64: pdfAttachment?.isBase64,
      size: pdfAttachment?.size,
      originalName: pdfAttachment?.originalName,
      storageType: pdfAttachment?.storageType,
      hasContentDocId: !!pdfAttachment?.contentDocId,
      postId: postDoc.id,
    });

    if (pdfAttachment) {
      let pdfContent = null;

      // Handle different storage types with enhanced debugging
      if (pdfAttachment.storageType === "inline" && pdfAttachment.content) {
        // Content stored inline
        console.log("📝 Serving from inline content");
        pdfContent = pdfAttachment.content;
      } else if (
        pdfAttachment.storageType === "separate" &&
        pdfAttachment.contentDocId
      ) {
        // Content stored in separate document
        console.log(
          "🔗 Retrieving content from separate document:",
          pdfAttachment.contentDocId
        );
        try {
          const contentDoc = await getDoc(
            doc(db, "pdf_contents", pdfAttachment.contentDocId)
          );
          if (contentDoc.exists()) {
            pdfContent = contentDoc.data().content;
            console.log("✅ Content retrieved from separate document");
          } else {
            console.log("❌ Separate content document not found");
          }
        } catch (error) {
          console.error("❌ Error retrieving separate content:", error);
        }
      } else if (pdfAttachment.content) {
        // Legacy or any content available - enhanced backward compatibility
        console.log("🔄 Serving from available content (legacy/fallback)");
        pdfContent = pdfAttachment.content;
      } else {
        console.log("❌ No content found in any storage method");
      }

      // Try to serve the content if available
      if (pdfContent) {
        console.log(
          "📤 Attempting to serve PDF content, length:",
          pdfContent.length
        );

        try {
          // Check if it's base64 or try to serve as is
          let fileBuffer;

          if (pdfAttachment.isBase64 !== false) {
            // Default to base64 if not specified
            console.log("🔄 Decoding base64 content");
            fileBuffer = Buffer.from(pdfContent, "base64");
          } else {
            console.log("📄 Using content as binary");
            fileBuffer = Buffer.from(pdfContent);
          }

          // Validate buffer
          if (fileBuffer.length === 0) {
            throw new Error("Empty buffer after decoding");
          }

          console.log(
            "✅ Successfully prepared buffer, size:",
            fileBuffer.length
          );

          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", "inline");
          res.setHeader("Cache-Control", "public, max-age=31536000");
          res.setHeader("X-Content-Type-Options", "nosniff");
          res.setHeader("Content-Length", fileBuffer.length.toString());

          return res.send(fileBuffer);
        } catch (bufferError) {
          console.error("❌ Error processing PDF buffer:", bufferError);
          return res.status(500).json({
            error: "Error processing PDF content",
            details: bufferError.message,
          });
        }
      } else {
        // No content available
        console.log("❌ PDF content not available");
        return res.status(404).json({
          error: "PDF content not available",
          message: "PDF metadata found but content is not accessible.",
          filename: filename,
          originalName: pdfAttachment.originalName || "Unknown",
          storageType: pdfAttachment.storageType || "unknown",
          debug: {
            hasContent: !!pdfAttachment.content,
            hasContentDocId: !!pdfAttachment.contentDocId,
            isBase64: pdfAttachment.isBase64,
          },
        });
      }
    }

    console.log("❌ PDF attachment not found in post document");
    return res.status(404).json({
      error: "PDF attachment not found",
      details: "Post found but no PDF attachment data",
    });
  } catch (error) {
    console.error("💥 Error serving PDF:", error);
    res.status(500).json({
      error: "Error serving PDF file",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
