import { IncomingForm } from "formidable";
import { promises as fs } from "fs";
import path from "path";
import { uploadToGoogleDrive } from "../../lib/gdrive";

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

    console.log("📂 Google Drive Upload - Environment check:", {
      isVercel: !!isVercel,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      NOW_REGION: process.env.NOW_REGION,
      uploadDir,
    });

    // Debug Google Drive configuration
    console.log("🔧 Google Drive Debug:", {
      hasApiKey: !!process.env.GOOGLE_DRIVE_API_KEY,
      hasFolderId: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || "root",
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
        console.log("📁 Created upload directory:", uploadDir);
      }
    }

    const [fields, files] = await form.parse(req);
    console.log("📂 Files parsed:", Object.keys(files));

    const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;

    if (!file) {
      console.log("❌ No file found in upload");
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    console.log("📄 File details:", {
      originalFilename: file.originalFilename,
      mimetype: file.mimetype,
      size: file.size,
      filepath: file.filepath,
    });

    // Validate file type
    if (!file.mimetype?.includes("pdf")) {
      console.log("❌ Invalid file type:", file.mimetype);
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    // Generate unique filename for Google Drive
    const timestamp = Date.now();
    const originalName = file.originalFilename || "document.pdf";
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const driveFilename = `${timestamp}_${sanitizedName}`;

    // Read file content
    const fileContent = await fs.readFile(file.filepath);

    console.log("📤 Uploading to Google Drive:", {
      filename: driveFilename,
      originalName,
      size: file.size,
      contentLength: fileContent.length,
    });

    try {
      // Upload file to Google Drive
      console.log("☁️ Uploading to Google Drive...");
      const driveResult = await uploadToGoogleDrive(
        fileContent,
        driveFilename,
        originalName
      );

      console.log("✅ Upload successful:", driveResult.fileId);

      // Clean up temporary file
      try {
        await fs.unlink(file.filepath);
        console.log("🗑️ Temp file cleaned up");
      } catch (error) {
        console.log(
          "⚠️ Temp file cleanup error (non-critical):",
          error.message
        );
      }

      // For local development, also save a copy locally (optional)
      if (!isVercel) {
        try {
          const localPath = path.join(uploadDir, driveFilename);
          await fs.writeFile(localPath, fileContent);
          console.log("💾 Local backup saved:", localPath);
        } catch (error) {
          console.log("⚠️ Local backup failed (non-critical):", error.message);
        }
      }

      // Return success response
      res.status(200).json({
        success: true,
        filename: driveFilename,
        originalName: originalName,
        url: `/api/serve-pdf/${driveFilename}`,
        size: file.size,
        storageType: "google_drive",
        driveFileId: driveResult.fileId,
        drivePublicUrl: driveResult.publicUrl,
        driveViewUrl: driveResult.viewUrl,
        driveEmbedUrl: driveResult.embedUrl,
        environment: isVercel ? "production" : "local",
        note: "PDF uploaded to Google Drive (FREE!)",
      });
    } catch (driveError) {
      console.error("❌ Google Drive upload failed:", driveError);

      // Fallback to old base64 method if Google Drive fails
      console.log("🔄 Falling back to base64 storage...");

      const base64Content = fileContent.toString("base64");

      // Clean up temp file
      try {
        await fs.unlink(file.filepath);
      } catch (error) {
        console.log("⚠️ Temp file cleanup error:", error.message);
      }

      res.status(200).json({
        success: true,
        filename: driveFilename,
        originalName: originalName,
        url: `/api/serve-pdf/${driveFilename}`,
        size: file.size,
        content: base64Content,
        isBase64: true,
        environment: isVercel ? "production" : "local",
        storageType: "base64_fallback",
        note: "Google Drive failed, using base64 fallback",
        error: driveError.message,
      });
    }
  } catch (error) {
    console.error("💥 PDF upload error:", error);
    res.status(500).json({
      error: "Failed to upload PDF",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
