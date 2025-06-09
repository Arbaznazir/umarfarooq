import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize2,
  Minimize2,
  FileText,
  Loader2,
} from "lucide-react";

// Set up PDF.js worker - use a reliable CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function ReactPDFViewer({
  pdfUrl,
  filename,
  onDownload,
  className = "",
}) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    console.log(`PDF loaded successfully. Pages: ${numPages}`);
  }, []);

  const onDocumentLoadError = useCallback((error) => {
    console.error("PDF loading error:", error);
    setError(error);
    setIsLoading(false);
  }, []);

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(3.0, prev + 0.25));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.25));
  };

  const rotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const goToPage = (page) => {
    const pageNum = parseInt(page);
    if (pageNum >= 1 && pageNum <= numPages) {
      setPageNumber(pageNum);
    }
  };

  if (error) {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}
      >
        {/* PDF viewer header */}
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center text-blue-600 mb-2">
            <FileText className="h-5 w-5 mr-2" />
            <h3 className="font-medium">PDF Document Viewer</h3>
          </div>
          <p className="text-blue-700 text-sm">
            Reading PDF document with full controls and navigation.
          </p>
        </div>

        {/* Fallback iframe viewer */}
        <div className="relative" style={{ height: "600px" }}>
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title={filename || "PDF Document"}
          />
        </div>

        {/* Fallback controls */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex justify-center space-x-3">
            {onDownload && (
              <button
                onClick={onDownload}
                className="px-4 py-2 bg-islamic-green text-white rounded hover:bg-emerald-600 transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
            )}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Open in New Tab
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}
    >
      {/* PDF Controls */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Page</span>
              <input
                type="number"
                min="1"
                max={numPages || 1}
                value={pageNumber}
                onChange={(e) => goToPage(e.target.value)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-islamic-green focus:border-islamic-green"
              />
              <span className="text-sm text-gray-500">
                of {numPages || "..."}
              </span>
            </div>

            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom and Rotation Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <span className="text-sm font-medium min-w-[4rem] text-center">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={zoomIn}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <button
              onClick={rotateClockwise}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              title="Rotate"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>

            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 bg-islamic-green text-white rounded hover:bg-emerald-600 transition-colors"
                title="Download PDF"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PDF Document */}
      <div
        className={`relative bg-gray-100 overflow-auto ${
          isFullscreen ? "fixed inset-0 z-50 bg-gray-900" : ""
        }`}
        style={{
          height: isFullscreen ? "100vh" : "600px",
          paddingTop: isFullscreen ? "60px" : "0",
        }}
      >
        {/* Fullscreen Controls */}
        {isFullscreen && (
          <div className="absolute top-0 left-0 right-0 bg-gray-800 text-white p-4 z-10">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">{filename}</h3>
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-islamic-green mx-auto mb-2" />
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}

        {/* PDF Document */}
        <div className="flex justify-center p-4">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading=""
            error=""
            className="shadow-lg"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              className="shadow-lg"
              loading={
                <div className="flex items-center justify-center h-96 bg-white border border-gray-200 rounded">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-islamic-green mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading page...</p>
                  </div>
                </div>
              }
              error={
                <div className="flex items-center justify-center h-96 bg-red-50 border border-red-200 rounded">
                  <div className="text-center text-red-600">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Failed to load page</p>
                  </div>
                </div>
              }
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>

      {/* PDF Info Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {filename && (
              <>📄 {filename.replace(/^\d+_/, "").replace(/_/g, " ")}</>
            )}
          </span>
          {numPages && (
            <span>
              {numPages} page{numPages > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
