import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default async function handler(req, res) {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: "Filename is required" });
  }

  try {
    console.log("🔍 Debug: Looking for PDF data:", filename);

    const postsQuery = query(
      collection(db, "posts"),
      where("pdfAttachment.filename", "==", filename)
    );

    const snapshot = await getDocs(postsQuery);

    if (snapshot.empty) {
      return res.status(404).json({
        error: "PDF not found",
        filename: filename,
        message: "No post found with this PDF filename",
      });
    }

    const postDoc = snapshot.docs[0];
    const postData = postDoc.data();
    const pdfAttachment = postData.pdfAttachment;

    // Create a debug response with all relevant info (excluding actual content for size)
    const debugInfo = {
      found: true,
      postId: postDoc.id,
      postTitle: postData.title,
      pdfAttachment: {
        filename: pdfAttachment?.filename,
        originalName: pdfAttachment?.originalName,
        url: pdfAttachment?.url,
        size: pdfAttachment?.size,
        isBase64: pdfAttachment?.isBase64,
        environment: pdfAttachment?.environment,
        storageType: pdfAttachment?.storageType,
        hasContent: !!pdfAttachment?.content,
        contentLength: pdfAttachment?.content
          ? pdfAttachment.content.length
          : 0,
        contentPreview: pdfAttachment?.content
          ? pdfAttachment.content.substring(0, 100) + "..."
          : null,
        hasContentDocId: !!pdfAttachment?.contentDocId,
        contentDocId: pdfAttachment?.contentDocId,
        warning: pdfAttachment?.warning,
        note: pdfAttachment?.note,
      },
      timestamp: new Date().toISOString(),
    };

    console.log("📄 Debug PDF data:", debugInfo);

    res.status(200).json(debugInfo);
  } catch (error) {
    console.error("💥 Debug error:", error);
    res.status(500).json({
      error: "Debug failed",
      details: error.message,
      filename: filename,
    });
  }
}
