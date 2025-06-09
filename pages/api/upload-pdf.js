import { IncomingForm } from "formidable";
import { promises as fs } from "fs";
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
      uploadDir,
    });

    // Verify Google Drive Service Account configuration
    if (
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    ) {
      console.error("❌ Google Drive Service Account not configured");
      return res.status(500).json({
        error: "Google Drive not configured",
        details:
          "GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY environment variables are required",
        note: "Please set up Service Account authentication for Google Drive",
      });
    }

    console.log("🔧 Google Drive Debug:", {
      hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      hasServiceAccountKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      hasFolderId: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || "root",
    });

    const form = new IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
    });

    // Ensure upload directory exists (only for temporary processing)
    if (!isVercel) {
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
        console.log("📁 Created temporary directory:", uploadDir);
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
      // Clean up temporary file
      try {
        await fs.unlink(file.filepath);
      } catch (error) {
        console.log("⚠️ Temp file cleanup error:", error.message);
      }
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    // Generate unique filename for Google Drive
    const timestamp = Date.now();
    const originalName = file.originalFilename || "document.pdf";
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const driveFilename = `${timestamp}_${sanitizedName}`;

    // Read file content
    const fileContent = await fs.readFile(file.filepath);

    console.log("📤 Uploading ONLY to Google Drive:", {
      filename: driveFilename,
      originalName,
      size: file.size,
      contentLength: fileContent.length,
    });

    try {
      // Upload file to Google Drive ONLY
      console.log("☁️ Uploading to Google Drive...");
      const driveResult = await uploadToGoogleDrive(
        fileContent,
        driveFilename,
        originalName
      );

      // Verify the upload was successful
      if (!driveResult.success || !driveResult.fileId) {
        throw new Error("Google Drive upload failed - no file ID received");
      }

      console.log("✅ Google Drive upload confirmed:", {
        fileId: driveResult.fileId,
        publicUrl: driveResult.publicUrl,
      });

      // Clean up temporary file immediately after successful upload
      try {
        await fs.unlink(file.filepath);
        console.log("🗑️ Temporary file cleaned up");
      } catch (error) {
        console.log(
          "⚠️ Temp file cleanup error (non-critical):",
          error.message
        );
      }

      // Return success response ONLY after Google Drive confirmation
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
        message: "✅ PDF successfully uploaded to Google Drive!",
        note: "File confirmed in Google Drive - FREE storage!",
      });
    } catch (driveError) {
      console.error("❌ Google Drive upload failed:", driveError);

      // Clean up temp file on failure
      try {
        await fs.unlink(file.filepath);
        console.log("🗑️ Temporary file cleaned up after failure");
      } catch (error) {
        console.log("⚠️ Temp file cleanup error:", error.message);
      }

      // Return error - NO FALLBACK, NO SUCCESS WITHOUT GOOGLE DRIVE
      res.status(500).json({
        success: false,
        error: "Google Drive upload failed",
        details: driveError.message,
        message: "❌ Upload failed - file not saved anywhere",
        note: "Please check your Google Drive Service Account configuration",
      });
    }
  } catch (error) {
    console.error("💥 PDF upload error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload PDF",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
