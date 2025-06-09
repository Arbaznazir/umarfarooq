import { google } from "googleapis";
import { Readable } from "stream";

// Google Drive API configuration using Service Account
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

// Service Account credentials (instead of API key)
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY =
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

// Initialize Google Drive API with Service Account
let auth;
let drive;

try {
  if (GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    // Use Service Account authentication
    auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
        type: "service_account",
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    drive = google.drive({
      version: "v3",
      auth: auth,
    });

    console.log("✅ Google Drive Service Account initialized");
  } else {
    console.error("❌ Google Drive Service Account credentials not configured");
  }
} catch (error) {
  console.error(
    "❌ Google Drive Service Account initialization failed:",
    error
  );
}

/**
 * Upload a PDF file to Google Drive using Service Account
 * @param {Buffer} fileBuffer - The PDF file buffer
 * @param {string} filename - The filename
 * @param {string} originalName - The original filename
 * @returns {Object} Upload result with file ID and public URL
 */
export async function uploadToGoogleDrive(fileBuffer, filename, originalName) {
  try {
    if (!drive) {
      throw new Error(
        "Google Drive Service Account not initialized. Please check your credentials."
      );
    }

    console.log("📤 Uploading to Google Drive:", {
      filename,
      originalName,
      size: fileBuffer.length,
    });

    // Create file metadata
    const fileMetadata = {
      name: filename,
      parents: GOOGLE_DRIVE_FOLDER_ID ? [GOOGLE_DRIVE_FOLDER_ID] : undefined,
      description: `Islamic PDF: ${originalName}`,
    };

    // Convert Buffer to Readable Stream
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null); // End the stream

    // Upload file to Google Drive
    const media = {
      mimeType: "application/pdf",
      body: stream,
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id,name,webViewLink,webContentLink,size",
    });

    const fileId = response.data.id;

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: fileId,
      resource: {
        role: "reader",
        type: "anyone",
      },
    });

    // Generate direct download URL
    const publicUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    console.log("✅ Google Drive upload successful:", {
      fileId,
      publicUrl,
      viewUrl,
      embedUrl,
    });

    return {
      success: true,
      fileId,
      publicUrl,
      viewUrl,
      embedUrl,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
      size: response.data.size,
      driveResponse: response.data,
    };
  } catch (error) {
    console.error("❌ Google Drive upload failed:", error);
    throw new Error(`Google Drive upload failed: ${error.message}`);
  }
}

/**
 * Get file information from Google Drive
 * @param {string} fileId - Google Drive file ID
 * @returns {Object} File information
 */
export async function getGoogleDriveFileInfo(fileId) {
  try {
    if (!drive) {
      throw new Error("Google Drive Service Account not initialized");
    }

    const response = await drive.files.get({
      fileId: fileId,
      fields:
        "id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime",
    });

    return {
      success: true,
      ...response.data,
      publicUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    };
  } catch (error) {
    console.error("❌ Google Drive file info failed:", error);
    throw new Error(`Failed to get file info: ${error.message}`);
  }
}

/**
 * Delete a file from Google Drive
 * @param {string} fileId - Google Drive file ID
 * @returns {boolean} Success status
 */
export async function deleteFromGoogleDrive(fileId) {
  try {
    if (!drive) {
      throw new Error("Google Drive Service Account not initialized");
    }

    await drive.files.delete({
      fileId: fileId,
    });

    console.log("✅ File deleted from Google Drive:", fileId);
    return true;
  } catch (error) {
    console.error("❌ Google Drive delete failed:", error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * List files in the Google Drive folder
 * @returns {Array} List of files
 */
export async function listGoogleDriveFiles() {
  try {
    if (!drive) {
      throw new Error("Google Drive Service Account not initialized");
    }

    const response = await drive.files.list({
      q: GOOGLE_DRIVE_FOLDER_ID
        ? `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and mimeType='application/pdf'`
        : "mimeType='application/pdf'",
      fields:
        "files(id,name,size,webViewLink,webContentLink,createdTime,modifiedTime)",
      orderBy: "createdTime desc",
    });

    return {
      success: true,
      files: response.data.files.map((file) => ({
        ...file,
        publicUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
        embedUrl: `https://drive.google.com/file/d/${file.id}/preview`,
      })),
    };
  } catch (error) {
    console.error("❌ Google Drive list failed:", error);
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

/**
 * Generate a proxy URL for serving PDFs through your API
 * @param {string} fileId - Google Drive file ID
 * @returns {string} Proxy URL
 */
export function getProxyUrl(fileId) {
  return `/api/serve-gdrive-pdf/${fileId}`;
}

export default {
  uploadToGoogleDrive,
  getGoogleDriveFileInfo,
  deleteFromGoogleDrive,
  listGoogleDriveFiles,
  getProxyUrl,
};
