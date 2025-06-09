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
    // Use /tmp for Vercel, local uploads for development
    const uploadDir = process.env.VERCEL ? "/tmp" : "./public/uploads/pdfs";

    const form = new IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
    });

    // Ensure upload directory exists (only for local development)
    if (!process.env.VERCEL) {
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }
    }

    const [fields, files] = await form.parse(req);

    const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;

    if (!file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    // Validate file type
    if (!file.mimetype?.includes("pdf")) {
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.originalFilename || "document.pdf";
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const newFilename = `${timestamp}_${sanitizedName}`;

    if (process.env.VERCEL) {
      // For Vercel deployment - read file content and encode as base64
      const fileContent = await fs.readFile(file.filepath);
      const base64Content = fileContent.toString("base64");

      // Clean up temp file
      try {
        await fs.unlink(file.filepath);
      } catch (error) {
        console.log("Temp file cleanup error (non-critical):", error);
      }

      // Return file data that can be stored in database
      res.status(200).json({
        success: true,
        filename: newFilename,
        originalName: originalName,
        url: `/api/serve-pdf/${newFilename}`,
        size: file.size,
        content: base64Content, // This should be stored in your database
        isBase64: true,
      });
    } else {
      // Local development - use file system
      const newPath = path.join(uploadDir, newFilename);
      await fs.rename(file.filepath, newPath);

      const fileUrl = `/uploads/pdfs/${newFilename}`;

      res.status(200).json({
        success: true,
        filename: newFilename,
        originalName: originalName,
        url: fileUrl,
        size: file.size,
      });
    }
  } catch (error) {
    console.error("PDF upload error:", error);
    res.status(500).json({ error: "Failed to upload PDF" });
  }
}
