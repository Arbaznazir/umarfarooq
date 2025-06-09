import { useState } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";

export default function PDFUploader({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length > 0) {
      uploadFile(pdfFiles[0]);
    } else {
      setUploadStatus({
        type: "error",
        message: "Please upload only PDF files",
      });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      uploadFile(file);
    } else {
      setUploadStatus({ type: "error", message: "Please select a PDF file" });
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadStatus({
          type: "success",
          message: `PDF uploaded successfully: ${result.originalName}`,
          data: result,
        });

        if (onUploadSuccess) {
          onUploadSuccess(result);
        }
      } else {
        setUploadStatus({
          type: "error",
          message: result.error || "Upload failed",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({ type: "error", message: "Failed to upload PDF" });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragging
            ? "border-islamic-green bg-emerald-50 scale-105"
            : uploading
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-islamic-green hover:bg-gray-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="space-y-4">
          {uploading ? (
            <>
              <div className="animate-spin mx-auto w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              <p className="text-blue-600 font-medium">Uploading PDF...</p>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-islamic-green to-emerald-600 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Upload PDF Document
                </p>
                <p className="text-gray-600">
                  Drag and drop your PDF file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Maximum file size: 50MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {uploadStatus && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-start space-x-3 ${
            uploadStatus.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {uploadStatus.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p
              className={`font-medium ${
                uploadStatus.type === "success"
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {uploadStatus.message}
            </p>
            {uploadStatus.data && (
              <div className="mt-2 space-y-1 text-sm text-green-700">
                <p>File size: {formatFileSize(uploadStatus.data.size)}</p>
                <p>
                  View PDF:
                  <a
                    href={`/pdf/${uploadStatus.data.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-islamic-green hover:text-emerald-600 underline font-medium"
                  >
                    Open in new tab
                  </a>
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setUploadStatus(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          PDF Upload Guidelines
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Only PDF files are accepted</li>
          <li>• Maximum file size is 50MB</li>
          <li>• Files will be accessible via direct URL</li>
          <li>• Perfect for Islamic books, research papers, and documents</li>
          <li>
            • Uploaded files can be viewed with zoom, download, and fullscreen
            options
          </li>
        </ul>
      </div>
    </div>
  );
}
