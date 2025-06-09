import { IncomingForm } from "formidable";
import { promises as fs } from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Enhanced environment detection
    const isVercel =
      process.env.VERCEL || process.env.VERCEL_ENV || process.env.NOW_REGION;
    const uploadDir = isVercel ? "/tmp" : "./public/uploads/pdfs";

    console.log("Environment check:", {
      isVercel: !!isVercel,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      NOW_REGION: process.env.NOW_REGION,
      uploadDir,
    });

    const form = new IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
    });

    // Ensure upload directory exists (only for local development)
    if (!isVercel) {
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
        console.log("Created upload directory:", uploadDir);
      }
    }

    const [fields, files] = await form.parse(req);
    console.log("Files parsed:", Object.keys(files));

    const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;

    if (!file) {
      console.log("No file found in upload");
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    console.log("File details:", {
      originalFilename: file.originalFilename,
      mimetype: file.mimetype,
      size: file.size,
      filepath: file.filepath,
    });

    // Validate file type
    if (!file.mimetype?.includes("pdf")) {
      console.log("Invalid file type:", file.mimetype);
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.originalFilename || "document.pdf";
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const newFilename = `${timestamp}_${sanitizedName}`;

    if (isVercel) {
      console.log("Processing for Vercel deployment");

      // For Vercel deployment - read file content and encode as base64
      const fileContent = await fs.readFile(file.filepath);
      const base64Content = fileContent.toString("base64");

      console.log("File processed:", {
        filename: newFilename,
        originalName,
        size: file.size,
        base64Length: base64Content.length,
      });

      // For production, we'll store ALL PDFs as base64 in the response
      // The frontend will handle storage in Firestore appropriately
      // This is a temporary solution until we implement Firebase Storage

      // Clean up temp file
      try {
        await fs.unlink(file.filepath);
        console.log("Temp file cleaned up");
      } catch (error) {
        console.log("Temp file cleanup error (non-critical):", error.message);
      }

      // Return file data with content for frontend to handle
      res.status(200).json({
        success: true,
        filename: newFilename,
        originalName: originalName,
        url: `/api/serve-pdf/${newFilename}`,
        size: file.size,
        content: base64Content, // Frontend will decide how to store this
        isBase64: true,
        environment: "vercel",
        note: "File processed for serverless environment",
      });
    } else {
      console.log("Processing for local development");

      // Local development - use file system
      const newPath = path.join(uploadDir, newFilename);
      await fs.rename(file.filepath, newPath);

      const fileUrl = `/uploads/pdfs/${newFilename}`;

      console.log("File saved locally:", {
        filename: newFilename,
        path: newPath,
        url: fileUrl,
      });

      res.status(200).json({
        success: true,
        filename: newFilename,
        originalName: originalName,
        url: fileUrl,
        size: file.size,
        environment: "local",
      });
    }
  } catch (error) {
    console.error("PDF upload error:", error);
    res.status(500).json({
      error: "Failed to upload PDF",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
