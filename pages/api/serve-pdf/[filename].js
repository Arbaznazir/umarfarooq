import fs from "fs";
import path from "path";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default async function handler(req, res) {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: "Filename is required" });
  }

  try {
    // First try to serve from file system (local development)
    if (!process.env.VERCEL) {
      const filePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "pdfs",
        filename
      );

      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
        res.setHeader("Cache-Control", "public, max-age=31536000");
        res.setHeader("X-Content-Type-Options", "nosniff");

        return res.send(fileBuffer);
      }
    }

    // For Vercel or if file not found locally, try to get from database
    const postsQuery = query(
      collection(db, "posts"),
      where("pdfAttachment.filename", "==", filename)
    );

    const snapshot = await getDocs(postsQuery);

    if (snapshot.empty) {
      return res.status(404).json({ error: "PDF file not found" });
    }

    const postDoc = snapshot.docs[0];
    const pdfAttachment = postDoc.data().pdfAttachment;

    if (pdfAttachment && pdfAttachment.content && pdfAttachment.isBase64) {
      // Serve from base64 content stored in database
      const fileBuffer = Buffer.from(pdfAttachment.content, "base64");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("Cache-Control", "public, max-age=31536000");
      res.setHeader("X-Content-Type-Options", "nosniff");

      return res.send(fileBuffer);
    }

    return res.status(404).json({ error: "PDF content not found" });
  } catch (error) {
    console.error("Error serving PDF:", error);
    res.status(500).json({ error: "Error serving PDF file" });
  }
}
