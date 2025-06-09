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

  console.log("🔍 Debug PDF:", filename);

  try {
    // Query for posts with this PDF
    const postsQuery = query(
      collection(db, "posts"),
      where("pdfAttachment.filename", "==", filename)
    );

    const snapshot = await getDocs(postsQuery);

    if (snapshot.empty) {
      return res.status(404).json({
        error: "PDF not found",
        message: `No post found with PDF filename: ${filename}`,
        searched: filename,
      });
    }

    const postDoc = snapshot.docs[0];
    const postData = postDoc.data();
    const pdfAttachment = postData.pdfAttachment;

    const debugInfo = {
      postId: postDoc.id,
      postTitle: postData.title,
      pdfAttachment: {
        filename: pdfAttachment?.filename,
        originalName: pdfAttachment?.originalName,
        size: pdfAttachment?.size,
        hasContent: !!pdfAttachment?.content,
        contentLength: pdfAttachment?.content
          ? pdfAttachment.content.length
          : 0,
        contentType: typeof pdfAttachment?.content,
        isBase64: pdfAttachment?.isBase64,
        storageType: pdfAttachment?.storageType,
        hasContentDocId: !!pdfAttachment?.contentDocId,
        contentDocId: pdfAttachment?.contentDocId,
        environment: pdfAttachment?.environment,
        url: pdfAttachment?.url,
      },
    };

    // If there's a separate content document, check it too
    if (pdfAttachment?.contentDocId) {
      try {
        const contentDoc = await getDoc(
          doc(db, "pdf_contents", pdfAttachment.contentDocId)
        );
        debugInfo.separateContent = {
          exists: contentDoc.exists(),
          hasContent: contentDoc.exists()
            ? !!contentDoc.data()?.content
            : false,
          contentLength: contentDoc.exists()
            ? contentDoc.data()?.content?.length || 0
            : 0,
        };
      } catch (error) {
        debugInfo.separateContentError = error.message;
      }
    }

    // Check if content starts with PDF header (if base64)
    if (pdfAttachment?.content) {
      try {
        const buffer = Buffer.from(pdfAttachment.content, "base64");
        const header = buffer.toString("ascii", 0, 4);
        debugInfo.pdfHeader = {
          isValidPDF: header === "%PDF",
          header: header,
          bufferLength: buffer.length,
        };
      } catch (error) {
        debugInfo.pdfHeaderError = error.message;
      }
    }

    return res.status(200).json(debugInfo);
  } catch (error) {
    console.error("Debug error:", error);
    return res.status(500).json({
      error: "Debug failed",
      details: error.message,
    });
  }
}
