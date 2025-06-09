import fs from "fs";
import path from "path";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: "Filename is required" });
  }

  console.log("🔧 Fixing PDF:", filename);

  try {
    // Decode the filename and create sanitized version
    const decodedFilename = decodeURIComponent(filename);
    const sanitizedFilename = decodedFilename.replace(/[^a-zA-Z0-9.-]/g, "_");

    console.log("🔍 Searching for PDF with filenames:", {
      decoded: decodedFilename,
      sanitized: sanitizedFilename,
    });

    // Find the PDF in the database
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
    let postDoc = null;

    for (const q of queries) {
      snapshot = await getDocs(q);
      if (!snapshot.empty) {
        postDoc = snapshot.docs[0];
        console.log("✅ Found post with PDF:", postDoc.id);
        break;
      }
    }

    if (!postDoc) {
      return res.status(404).json({
        error: "PDF not found",
        message: "No post found with this PDF filename",
      });
    }

    const postData = postDoc.data();
    const pdfAttachment = postData.pdfAttachment;

    console.log("📄 Current PDF status:", {
      filename: pdfAttachment.filename,
      storageType: pdfAttachment.storageType,
      hasContent: !!pdfAttachment.content,
      size: pdfAttachment.size,
    });

    // Check if we need to fix this PDF
    if (
      pdfAttachment.storageType !== "metadata_only" &&
      pdfAttachment.content
    ) {
      return res.status(200).json({
        message: "PDF is already working correctly",
        filename: pdfAttachment.filename,
        storageType: pdfAttachment.storageType,
      });
    }

    // Try to find the original file locally
    const possiblePaths = [
      path.join(process.cwd(), "public", "uploads", "pdfs", decodedFilename),
      path.join(process.cwd(), "public", "uploads", "pdfs", sanitizedFilename),
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "pdfs",
        pdfAttachment.filename
      ),
    ];

    let foundPath = null;
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        foundPath = filePath;
        console.log("✅ Found local file:", filePath);
        break;
      }
    }

    if (!foundPath) {
      return res.status(404).json({
        error: "Local file not found",
        message:
          "Cannot fix PDF because the original file is not available locally",
        searchedPaths: possiblePaths,
      });
    }

    // Read the file and convert to base64
    console.log("📖 Reading file content...");
    const fileBuffer = fs.readFileSync(foundPath);
    const base64Content = fileBuffer.toString("base64");
    const fileSize = fileBuffer.length;

    console.log("📊 File processing complete:", {
      size: fileSize,
      base64Length: base64Content.length,
      isValidPDF: fileBuffer.toString("ascii", 0, 4) === "%PDF",
    });

    // Update the PDF attachment with content
    const updatedPdfAttachment = {
      ...pdfAttachment,
      content: base64Content,
      storageType: "inline",
      isBase64: true,
      hasContent: true,
      fixedAt: new Date().toISOString(),
      environment: "local_fix",
    };

    // Check if content will fit in Firestore (conservative 800KB limit)
    const contentSize = base64Content.length;
    const firestoreLimit = 800000;

    let updateData = {};

    if (contentSize < firestoreLimit) {
      // Store content inline
      console.log("💾 Storing content inline (within size limit)");
      updateData = {
        pdfAttachment: updatedPdfAttachment,
        updatedAt: serverTimestamp(),
      };
    } else {
      // Store content in separate document
      console.log("💾 Storing content in separate document (large file)");

      try {
        const pdfContentRef = await addDoc(collection(db, "pdf_contents"), {
          filename: pdfAttachment.filename,
          content: base64Content,
          createdAt: serverTimestamp(),
          size: fileSize,
          postId: postDoc.id,
        });

        updateData = {
          pdfAttachment: {
            ...pdfAttachment,
            contentDocId: pdfContentRef.id,
            storageType: "separate",
            isBase64: true,
            hasContent: true,
            fixedAt: new Date().toISOString(),
            environment: "local_fix",
          },
          updatedAt: serverTimestamp(),
        };

        console.log(
          "✅ Content stored in separate document:",
          pdfContentRef.id
        );
      } catch (error) {
        console.error("❌ Failed to store in separate document:", error);
        return res.status(500).json({
          error: "Failed to store PDF content",
          details: error.message,
        });
      }
    }

    // Update the post document
    await updateDoc(doc(db, "posts", postDoc.id), updateData);

    console.log("✅ PDF fixed successfully");

    return res.status(200).json({
      success: true,
      message: "PDF fixed successfully",
      filename: pdfAttachment.filename,
      originalStorageType: pdfAttachment.storageType,
      newStorageType: updateData.pdfAttachment.storageType,
      size: fileSize,
      contentLength: base64Content.length,
      postId: postDoc.id,
      postTitle: postData.title,
    });
  } catch (error) {
    console.error("💥 Error fixing PDF:", error);
    return res.status(500).json({
      error: "Failed to fix PDF",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
