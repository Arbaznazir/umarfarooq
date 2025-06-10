import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  ExternalLink,
  Info,
  Eye,
  RefreshCw,
} from "lucide-react";
import FaviconHead from "../../components/FaviconHead";
import ReactPDFViewer from "../../components/ReactPDFViewer";

export default function PDFViewer() {
  const router = useRouter();
  const { filename } = router.query;
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [actualFileSize, setActualFileSize] = useState(null);
  const [canDisplayPDF, setCanDisplayPDF] = useState(false);
  const [viewMode, setViewMode] = useState("auto"); // auto, react-pdf, iframe, direct
  const [showReactPDF, setShowReactPDF] = useState(true);

  useEffect(() => {
    if (filename) {
      const encodedFilename = encodeURIComponent(filename);
      setPdfUrl(`/api/serve-pdf/${encodedFilename}`);
      checkPDFAvailability(encodedFilename);
    }
  }, [filename]);

  const checkPDFAvailability = async (encodedFilename) => {
    setIsLoading(true);
    try {
      // First check if PDF is accessible
      const response = await fetch(`/api/serve-pdf/${encodedFilename}`, {
        method: "HEAD",
      });

      if (response.ok) {
        // Get actual file size from Content-Length header
        const contentLength = response.headers.get("content-length");
        if (contentLength) {
          setActualFileSize(parseInt(contentLength));
        }

        // If we get a successful response, we can display the PDF
        setCanDisplayPDF(true);
        console.log("✅ PDF is available for display");
      } else {
        // Get detailed error information
        const errorResponse = await fetch(`/api/serve-pdf/${encodedFilename}`);
        const errorData = await errorResponse.json();
        setError(errorData);
        setCanDisplayPDF(false);

        // Also try to get debug info
        try {
          const debugResponse = await fetch(
            `/api/debug-pdf/${encodedFilename}`
          );
          if (debugResponse.ok) {
            const debugData = await debugResponse.json();
            setPdfInfo(debugData);
          }
        } catch (debugError) {
          console.error("Debug fetch failed:", debugError);
        }
      }
    } catch (err) {
      setError({
        error: "Network Error",
        message: "Failed to check PDF availability",
        details: err.message,
      });
      setCanDisplayPDF(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // For metadata_only PDFs in production, show helpful message
      if (error?.isProduction && error?.storageType === "metadata_only") {
        alert(
          "This PDF file is too large and is not available for download in production. Please contact the administrator to upload this file to cloud storage."
        );
        return;
      }

      // For other errors or metadata_only in local development
      if (error?.isLargeFile || error?.storageType === "metadata_only") {
        alert(
          "This PDF file is too large and cannot be downloaded directly. Please contact the administrator for access to this file."
        );
        return;
      }

      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "document.pdf";
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      alert("Download failed. The file may not be available for download.");
    }
  };

  const handleReactPDFError = () => {
    console.log("React-PDF failed, switching to iframe fallback");
    setShowReactPDF(false);
  };

  const handleRetry = () => {
    setShowReactPDF(true);
    setError(null);
    if (filename) {
      const encodedFilename = encodeURIComponent(filename);
      checkPDFAvailability(encodedFilename);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  if (!filename) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Loading PDF...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>PDF Viewer - {filename} | Umar Farooq Al Madani</title>
        <meta name="description" content={`View PDF document: ${filename}`} />
      </Head>
      <FaviconHead />

      {/* Header Controls */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center px-4 py-2 bg-islamic-green text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                {decodeURIComponent(
                  filename.replace(/^\d+_/, "").replace(/_/g, " ")
                )}
              </h1>
              {(pdfInfo?.pdfAttachment?.size || actualFileSize) && (
                <span className="text-sm text-gray-500">
                  {formatFileSize(actualFileSize || pdfInfo.pdfAttachment.size)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRetry}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              title="Retry loading PDF"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              disabled={
                error?.isProduction && error?.storageType === "metadata_only"
              }
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-green mx-auto mb-4"></div>
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-4xl mx-auto">
            {/* Error Display */}
            <div
              className={`border-l-4 p-6 rounded-lg ${
                error.isLargeFile || error.storageType === "metadata_only"
                  ? "bg-amber-50 border-amber-400"
                  : "bg-red-50 border-red-400"
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {error.isLargeFile ||
                  error.storageType === "metadata_only" ? (
                    <Info className="h-5 w-5 text-amber-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3
                    className={`text-sm font-medium ${
                      error.isLargeFile || error.storageType === "metadata_only"
                        ? "text-amber-800"
                        : "text-red-800"
                    }`}
                  >
                    {error.isLargeFile || error.storageType === "metadata_only"
                      ? "Large File Notice"
                      : "PDF Loading Error"}
                  </h3>
                  <div
                    className={`mt-2 text-sm ${
                      error.isLargeFile || error.storageType === "metadata_only"
                        ? "text-amber-700"
                        : "text-red-700"
                    }`}
                  >
                    <p>{error.message || "Failed to load PDF document"}</p>
                    {error.details && (
                      <p className="mt-1 text-xs opacity-75">{error.details}</p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={handleDownload}
                      disabled={
                        error.isProduction &&
                        error.storageType === "metadata_only"
                      }
                      className={`text-sm px-3 py-1 rounded transition-colors ${
                        error.isLargeFile ||
                        error.storageType === "metadata_only"
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Download className="h-3 w-3 mr-1 inline" />
                      Download PDF
                    </button>
                    <button
                      onClick={handleRetry}
                      className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      <RefreshCw className="h-3 w-3 mr-1 inline" />
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Debug Information */}
            {pdfInfo && process.env.NODE_ENV === "development" && (
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Debug Info</h4>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {JSON.stringify(pdfInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : canDisplayPDF ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* PDF Viewer Mode Selector */}
            <div className="bg-blue-50 border-b border-blue-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-blue-600">
                  <Eye className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    PDF Document Viewer
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowReactPDF(true)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      showReactPDF
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    Advanced
                  </button>
                  <button
                    onClick={() => setShowReactPDF(false)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      !showReactPDF
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    Simple
                  </button>
                </div>
              </div>
            </div>

            {/* PDF Content */}
            {showReactPDF ? (
              <ReactPDFViewer
                pdfUrl={pdfUrl}
                filename={filename}
                onDownload={handleDownload}
                onError={handleReactPDFError}
                className="border-0"
              />
            ) : (
              <div className="p-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 text-blue-600 mr-2" />
                    <p className="text-sm text-blue-800">
                      Simple PDF Viewer - Using browser's built-in PDF display
                    </p>
                  </div>
                </div>
                <iframe
                  src={pdfUrl}
                  className="w-full border border-gray-300 rounded-lg"
                  style={{ height: "80vh", minHeight: "600px" }}
                  title={filename}
                />
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    onClick={handleDownload}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </button>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                PDF Not Available
              </h2>
              <p className="text-gray-600 mb-4">
                The requested PDF document could not be loaded.
              </p>
              <button
                onClick={handleRetry}
                className="flex items-center px-4 py-2 bg-islamic-green text-white rounded-lg hover:bg-emerald-600 transition-colors mx-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
