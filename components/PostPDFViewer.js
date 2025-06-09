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
  Info,
} from "lucide-react";
import ReactPDFViewer from "./ReactPDFViewer";

export default function PostPDFViewer({ pdfAttachment }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorData, setErrorData] = useState(null);
  const [actualFileSize, setActualFileSize] = useState(null);

  if (!pdfAttachment) return null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get actual file size by making a HEAD request to the serve-pdf endpoint
  useEffect(() => {
    const getActualFileSize = async () => {
      try {
        const pdfUrl = `/api/serve-pdf/${encodeURIComponent(
          pdfAttachment.filename
        )}`;
        const response = await fetch(pdfUrl, { method: "HEAD" });

        if (response.ok) {
          const contentLength = response.headers.get("content-length");
          if (contentLength) {
            setActualFileSize(parseInt(contentLength));
          }
        }
      } catch (error) {
        console.log("Could not get actual file size:", error);
      }
    };

    if (pdfAttachment.filename) {
      getActualFileSize();
    }
  }, [pdfAttachment.filename]);

  const pdfUrl = `/api/serve-pdf/${encodeURIComponent(pdfAttachment.filename)}`;

  // Check if this is a metadata_only PDF (too large to be stored)
  const isMetadataOnly =
    pdfAttachment.storageType === "metadata_only" ||
    (!pdfAttachment.content && !pdfAttachment.contentDocId);

  // Use actual file size if available, otherwise fall back to stored size
  const displaySize = actualFileSize || pdfAttachment.size || 0;

  const handleViewPDF = async () => {
    if (isMetadataOnly) {
      // For metadata_only PDFs, redirect to full screen viewer
      window.open(
        `/pdf/${encodeURIComponent(pdfAttachment.filename)}`,
        "_blank"
      );
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // Test if PDF is accessible before showing viewer
    try {
      const response = await fetch(pdfUrl, { method: "HEAD" });
      if (response.ok) {
        setIsExpanded(!isExpanded);
      } else {
        setHasError(true);
        setErrorMessage("PDF is not accessible for viewing");
      }
    } catch (error) {
      console.error("PDF accessibility check failed:", error);
      setHasError(true);
      setErrorMessage("Failed to check PDF accessibility");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // For metadata_only PDFs, we need to handle download differently
      if (isMetadataOnly) {
        // Try direct download first
        const response = await fetch(pdfUrl);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = pdfAttachment.originalName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          return;
        } else {
          // Check if this is a production error
          const errorData = await response.json();
          if (errorData.isProduction) {
            alert(
              "This PDF file is too large and is not available for download in production. Please contact the administrator to upload this file to cloud storage."
            );
            return;
          }
        }

        // Fallback to opening in new tab
        window.open(
          `/pdf/${encodeURIComponent(pdfAttachment.filename)}`,
          "_blank"
        );
        return;
      }

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

      const debugUrl = `/api/debug-pdf/${encodeURIComponent(
        pdfAttachment.filename
      )}`;
      console.log("🔍 Debug: Fetching from:", debugUrl);

      const response = await fetch(debugUrl);
      const debugData = await response.json();

      console.log("🔍 Debug: Server Response:", debugData);

      // Show debug info in alert for quick viewing
      const debugText = JSON.stringify(debugData, null, 2);

      // Create a modal-like alert
      const confirmed = window.confirm(
        `Debug Info for ${pdfAttachment.originalName}:\n\n` +
          `Has Content: ${debugData.pdfAttachment?.hasContent}\n` +
          `Content Length: ${debugData.pdfAttachment?.contentLength}\n` +
          `Storage Type: ${
            debugData.pdfAttachment?.storageType || "not set"
          }\n` +
          `Is Base64: ${debugData.pdfAttachment?.isBase64}\n` +
          `PDF Header Valid: ${debugData.pdfHeader?.isValidPDF}\n` +
          `Actual File Size: ${
            actualFileSize ? formatFileSize(actualFileSize) : "Unknown"
          }\n` +
          `Database Size: ${formatFileSize(pdfAttachment.size)}\n\n` +
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
                PDF Document • {formatFileSize(displaySize)}
                {actualFileSize && actualFileSize !== pdfAttachment.size && (
                  <span className="text-xs text-green-600 ml-1">
                    (actual size)
                  </span>
                )}
              </p>
              {isMetadataOnly && (
                <div className="flex items-center mt-1">
                  <Info className="h-3 w-3 text-amber-600 mr-1" />
                  <p className="text-xs text-amber-600 font-medium">
                    Large file - download for viewing
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isMetadataOnly && (
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
            )}

            <button
              onClick={handleDownload}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>

            <a
              href={`/pdf/${encodeURIComponent(pdfAttachment.filename)}`}
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

      {/* Metadata Only Warning */}
      {isMetadataOnly && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-amber-400 mr-3" />
            <div>
              <h4 className="text-amber-800 font-medium">Large File Notice</h4>
              <p className="text-amber-700 text-sm mt-1">
                This PDF file is too large to be viewed inline. Please use the
                download or full-screen options.
              </p>
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={handleDownload}
                  className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded hover:bg-amber-200 transition-colors flex items-center"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download PDF
                </button>
                <a
                  href={`/pdf/${encodeURIComponent(pdfAttachment.filename)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 transition-colors inline-flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

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

              {/* Show recommendations if available */}
              {errorData?.recommendations && (
                <ul className="text-red-700 text-xs mt-2 list-disc list-inside">
                  {errorData.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              )}

              <div className="mt-3 flex space-x-3">
                <button
                  onClick={handleDownload}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  Download PDF
                </button>
                <a
                  href={`/pdf/${encodeURIComponent(pdfAttachment.filename)}`}
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

      {/* React PDF Viewer */}
      {isExpanded && !hasError && !isMetadataOnly && (
        <div className="relative">
          <ReactPDFViewer
            pdfUrl={pdfUrl}
            filename={pdfAttachment.originalName}
            onDownload={handleDownload}
            className="border-0"
          />

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
          💡 Click "View PDF" to read inline with advanced controls, "Full
          Screen" for dedicated viewer, or "Download" to save locally
        </p>
        {isMetadataOnly && (
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ This is a large file. For best experience, use "Download" or
            "Full Screen" options.
          </p>
        )}
        {actualFileSize && actualFileSize !== pdfAttachment.size && (
          <p className="text-xs text-green-600 mt-1">
            ✅ Actual file size: {formatFileSize(actualFileSize)}
          </p>
        )}
      </div>
    </div>
  );
}
