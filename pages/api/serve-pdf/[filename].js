import fs from "fs";
import path from "path";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default async function handler(req, res) {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: "Filename is required" });
  }

  console.log("Serving PDF:", filename);

  try {
    // Enhanced environment detection
    const isVercel =
      process.env.VERCEL || process.env.VERCEL_ENV || process.env.NOW_REGION;

    console.log("Environment check:", {
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

      console.log("Checking local file:", filePath);

      if (fs.existsSync(filePath)) {
        console.log("Serving from local file system");
        const fileBuffer = fs.readFileSync(filePath);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
        res.setHeader("Cache-Control", "public, max-age=31536000");
        res.setHeader("X-Content-Type-Options", "nosniff");

        return res.send(fileBuffer);
      } else {
        console.log("Local file not found, checking database");
      }
    }

    // For Vercel or if file not found locally, try to get from database
    console.log("Querying database for PDF:", filename);

    const postsQuery = query(
      collection(db, "posts"),
      where("pdfAttachment.filename", "==", filename)
    );

    const snapshot = await getDocs(postsQuery);

    if (snapshot.empty) {
      console.log("PDF not found in database");
      return res.status(404).json({ error: "PDF file not found" });
    }

    const postDoc = snapshot.docs[0];
    const pdfAttachment = postDoc.data().pdfAttachment;

    console.log("PDF attachment found:", {
      hasContent: !!pdfAttachment?.content,
      isBase64: pdfAttachment?.isBase64,
      size: pdfAttachment?.size,
      originalName: pdfAttachment?.originalName,
    });

    if (pdfAttachment) {
      // Try to serve from base64 content if available
      if (pdfAttachment.content && pdfAttachment.isBase64) {
        console.log("Serving from database base64 content");

        const fileBuffer = Buffer.from(pdfAttachment.content, "base64");

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
        res.setHeader("Cache-Control", "public, max-age=31536000");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Length", fileBuffer.length.toString());

        return res.send(fileBuffer);
      } else {
        // If no content stored (large file), return a placeholder or redirect
        console.log(
          "PDF attachment found but content not stored (likely large file)"
        );
        return res.status(404).json({
          error: "PDF content not available",
          message:
            "Large PDF files are not stored in database. Please re-upload the file.",
          filename: filename,
          originalName: pdfAttachment.originalName || "Unknown",
        });
      }
    }

    console.log("PDF content not available");
    return res.status(404).json({ error: "PDF content not found" });
  } catch (error) {
    console.error("Error serving PDF:", error);
    res.status(500).json({
      error: "Error serving PDF file",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
