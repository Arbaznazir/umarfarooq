import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).json({ error: "Filename is required" });
  }

  // Construct the file path
  const filePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "pdfs",
    filename
  );

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "PDF file not found" });
  }

  try {
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Set proper headers for PDF viewing
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Send the file
    res.send(fileBuffer);
  } catch (error) {
    console.error("Error serving PDF:", error);
    res.status(500).json({ error: "Error serving PDF file" });
  }
}
