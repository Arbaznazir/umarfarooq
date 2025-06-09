import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Eye,
  Maximize2,
  X,
  AlertTriangle,
  ExternalLink,
  Bug,
} from "lucide-react";

export default function PostPDFViewer({ pdfAttachment }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!pdfAttachment) return null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const pdfUrl = `/api/serve-pdf/${pdfAttachment.filename}`;

  const handleViewPDF = async () => {
    if (!isExpanded) {
      setIsLoading(true);
      setHasError(false);

      try {
        // Test if the PDF is accessible
        const response = await fetch(pdfUrl, { method: "HEAD" });
        if (!response.ok) {
          throw new Error(`PDF not accessible (${response.status})`);
        }
        setIsExpanded(true);
      } catch (error) {
        console.error("PDF access error:", error);
        setHasError(true);
        setErrorMessage(error.message || "Failed to load PDF");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsExpanded(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdfAttachment.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      // Fallback to direct link
      window.open(pdfUrl, "_blank");
    }
  };

  const handleDebug = async () => {
    try {
      console.log("🔍 Debug: PDF Attachment Data:", pdfAttachment);

      const debugUrl = `/api/debug-pdf/${pdfAttachment.filename}`;
      console.log("🔍 Debug: Fetching from:", debugUrl);

      const response = await fetch(debugUrl);
      const debugData = await response.json();

      console.log("🔍 Debug: Server Response:", debugData);

      // Show debug info in alert for quick viewing
      const debugText = JSON.stringify(debugData, null, 2);

      // Create a modal-like alert
      const confirmed = window.confirm(
        `Debug Info for ${pdfAttachment.originalName}:\n\n` +
          `Found: ${debugData.found}\n` +
          `Has Content: ${debugData.pdfAttachment?.hasContent}\n` +
          `Content Length: ${debugData.pdfAttachment?.contentLength}\n` +
          `Storage Type: ${
            debugData.pdfAttachment?.storageType || "not set"
          }\n` +
          `Is Base64: ${debugData.pdfAttachment?.isBase64}\n\n` +
          `Full debug data logged to console. Click OK to copy debug data to clipboard.`
      );

      if (confirmed) {
        navigator.clipboard.writeText(debugText).catch(() => {
          console.log("Could not copy to clipboard, debug data in console");
        });
      }
    } catch (error) {
      console.error("Debug error:", error);
      alert(`Debug failed: ${error.message}`);
    }
  };

  return (
    <div className="my-8 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* PDF Header */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 rounded-lg p-2">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                📄 {pdfAttachment.originalName}
              </h3>
              <p className="text-sm text-gray-600">
                PDF Document • {formatFileSize(pdfAttachment.size)}
              </p>
              {(pdfAttachment.storageType === "metadata_only" ||
                (!pdfAttachment.content && !pdfAttachment.contentDocId)) && (
                <p className="text-xs text-amber-600 font-medium">
                  ⚠️ Large file - download for viewing
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleViewPDF}
              disabled={isLoading}
              className="flex items-center px-3 py-2 bg-islamic-green text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Loading...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  {isExpanded ? "Hide" : "View"} PDF
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>

            <a
              href={`/pdf/${pdfAttachment.filename}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Full Screen
            </a>

            {/* Debug button - only show in development */}
            {process.env.NODE_ENV === "development" && (
              <button
                onClick={handleDebug}
                className="flex items-center px-2 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors duration-200 text-xs font-medium"
                title="Debug PDF Data"
              >
                <Bug className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {hasError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h4 className="text-red-800 font-medium">PDF Viewing Error</h4>
              <p className="text-red-700 text-sm mt-1">
                {errorMessage}. Please try downloading the file instead.
              </p>
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={handleDownload}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  Download PDF
                </button>
                <a
                  href={`/pdf/${pdfAttachment.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 transition-colors inline-flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open in New Tab
                </a>
                {process.env.NODE_ENV === "development" && (
                  <button
                    onClick={handleDebug}
                    className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition-colors inline-flex items-center"
                  >
                    <Bug className="h-3 w-3 mr-1" />
                    Debug
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      {isExpanded && !hasError && (
        <div className="relative">
          <div className="bg-gray-100 p-4">
            {/* Enhanced PDF viewer with multiple fallbacks */}
            <div className="relative w-full h-96 rounded-lg shadow-inner bg-white">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full rounded-lg"
                title={`PDF Viewer - ${pdfAttachment.originalName}`}
                onError={() => {
                  setHasError(true);
                  setErrorMessage("PDF viewer failed to load");
                }}
              />

              {/* Fallback for browsers that don't support iframe */}
              <noscript>
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      PDF preview requires JavaScript
                    </p>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-islamic-green text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Open PDF
                    </a>
                  </div>
                </div>
              </noscript>
            </div>
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors duration-200 z-20"
            title="Collapse PDF viewer"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* PDF Info Footer */}
      <div className="bg-gray-50 px-6 py-3 text-center">
        <p className="text-xs text-gray-500">
          💡 Click "View PDF" to read inline, "Full Screen" for better reading
          experience, or "Download" to save locally
        </p>
        {(pdfAttachment.storageType === "metadata_only" ||
          (!pdfAttachment.content && !pdfAttachment.contentDocId)) && (
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ This is a large file. For best experience, use "Download" or
            "Full Screen" options.
          </p>
        )}
      </div>
    </div>
  );
}
