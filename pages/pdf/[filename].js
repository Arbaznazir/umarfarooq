import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  ArrowLeft,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  AlertTriangle,
  ExternalLink,
  Info,
} from "lucide-react";
import FaviconHead from "../../components/FaviconHead";

export default function PDFViewer() {
  const router = useRouter();
  const { filename } = router.query;
  const [pdfUrl, setPdfUrl] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [actualFileSize, setActualFileSize] = useState(null);
  const [canDisplayPDF, setCanDisplayPDF] = useState(false);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const adjustZoom = (delta) => {
    setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
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
    <div className="min-h-screen bg-gray-900">
      <Head>
        <title>PDF Viewer - {filename} | Umar Farooq Al Madani</title>
        <meta name="description" content={`View PDF document: ${filename}`} />
      </Head>
      <FaviconHead />

      {/* Header Controls */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center px-4 py-2 bg-islamic-green hover:bg-emerald-600 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-lg font-semibold truncate max-w-md">
            {decodeURIComponent(filename.replace(/^\d+_/, ""))}
          </h1>
          {(pdfInfo?.pdfAttachment?.size || actualFileSize) && (
            <span className="text-sm text-gray-300">
              (
              {(
                (actualFileSize || pdfInfo.pdfAttachment.size) /
                (1024 * 1024)
              ).toFixed(2)}{" "}
              MB)
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Zoom Controls - only show if PDF is viewable */}
          {canDisplayPDF && !error && (
            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-2">
              <button
                onClick={() => adjustZoom(-25)}
                className="p-2 hover:bg-gray-600 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => adjustZoom(25)}
                className="p-2 hover:bg-gray-600 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          {canDisplayPDF && !error && (
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
            disabled={
              error?.isProduction && error?.storageType === "metadata_only"
            }
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-900 p-4">
        <div className="max-w-full mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-green mx-auto mb-4"></div>
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-8">
              {/* Error Display */}
              <div
                className={`border-l-4 p-4 rounded-lg ${
                  error.isLargeFile || error.storageType === "metadata_only"
                    ? "bg-amber-50 border-amber-400"
                    : "bg-red-50 border-red-400"
                }`}
              >
                <div className="flex items-center">
                  {error.isLargeFile ||
                  error.storageType === "metadata_only" ? (
                    <Info className="h-6 w-6 text-amber-400 mr-3" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
                  )}
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${
                        error.isLargeFile ||
                        error.storageType === "metadata_only"
                          ? "text-amber-800"
                          : "text-red-800"
                      }`}
                    >
                      {error.isLargeFile ||
                      error.storageType === "metadata_only"
                        ? error.isProduction
                          ? "File Not Available in Production"
                          : "Large File Notice"
                        : "PDF Not Available"}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${
                        error.isLargeFile ||
                        error.storageType === "metadata_only"
                          ? "text-amber-700"
                          : "text-red-700"
                      }`}
                    >
                      {error.message ||
                        error.details ||
                        "This PDF file could not be loaded."}
                    </p>

                    {/* Show recommendations if available */}
                    {error.recommendations && (
                      <ul
                        className={`text-sm mt-3 list-disc list-inside ${
                          error.isLargeFile ||
                          error.storageType === "metadata_only"
                            ? "text-amber-700"
                            : "text-red-700"
                        }`}
                      >
                        {error.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    )}

                    {/* File Info */}
                    {pdfInfo && (
                      <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                        <h4 className="font-medium text-gray-800 mb-2">
                          File Information:
                        </h4>
                        <div className="space-y-1 text-gray-600">
                          <p>
                            <strong>Original Name:</strong>{" "}
                            {pdfInfo.pdfAttachment?.originalName}
                          </p>
                          <p>
                            <strong>Size:</strong>{" "}
                            {pdfInfo.pdfAttachment?.size
                              ? (
                                  pdfInfo.pdfAttachment.size /
                                  (1024 * 1024)
                                ).toFixed(2) + " MB"
                              : "Unknown"}
                          </p>
                          <p>
                            <strong>Storage Type:</strong>{" "}
                            {pdfInfo.pdfAttachment?.storageType || "Unknown"}
                          </p>
                          <p>
                            <strong>Post:</strong> {pdfInfo.postTitle}
                          </p>
                          {error?.isProduction && (
                            <p>
                              <strong>Environment:</strong> Production
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex space-x-3">
                      {!error.isProduction && !error.isLargeFile && (
                        <button
                          onClick={handleDownload}
                          className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors text-sm"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Try Download
                        </button>
                      )}

                      <button
                        onClick={() => router.back()}
                        className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors text-sm"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Go Back
                      </button>

                      {pdfInfo?.postId && (
                        <a
                          href={`/post/${pdfInfo.postId}`}
                          className="inline-flex items-center px-3 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors text-sm"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Post
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : canDisplayPDF ? (
            <div className="relative">
              <iframe
                src={pdfUrl}
                className="w-full h-[calc(100vh-120px)] border-0"
                title={`PDF Viewer - ${filename}`}
                style={{
                  minHeight: "600px",
                  backgroundColor: "#ffffff",
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top left",
                }}
                onLoad={() => console.log("PDF loaded successfully")}
                onError={() => {
                  console.error("PDF failed to load in iframe");
                  setError({
                    error: "PDF Viewer Error",
                    message: "The PDF could not be displayed in this viewer.",
                  });
                  setCanDisplayPDF(false);
                }}
              />

              {/* Fallback for browsers that don't support iframe PDF viewing */}
              <noscript>
                <div className="flex items-center justify-center h-96 bg-gray-100">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Your browser doesn't support PDF viewing.
                    </p>
                    <a
                      href={pdfUrl}
                      download={filename}
                      className="inline-flex items-center px-4 py-2 bg-islamic-green text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </a>
                  </div>
                </div>
              </noscript>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  PDF Not Available
                </h3>
                <p className="text-gray-600">
                  This PDF file could not be loaded or displayed.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Islamic Footer */}
      <div className="bg-gradient-to-r from-islamic-green to-emerald-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-4">
            <p className="text-lg font-amiri text-arabic leading-relaxed">
              وَقُل رَّبِّ زِدْنِي عِلْمًا
            </p>
          </div>
          <p className="text-emerald-100 italic">
            "And say: My Lord, increase me in knowledge" - Quran 20:114
          </p>
        </div>
      </div>
    </div>
  );
}
