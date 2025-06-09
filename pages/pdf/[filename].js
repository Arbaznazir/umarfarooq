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
} from "lucide-react";
import FaviconHead from "../../components/FaviconHead";

export default function PDFViewer() {
  const router = useRouter();
  const { filename } = router.query;
  const [pdfUrl, setPdfUrl] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (filename) {
      // Use the API route to serve the PDF
      setPdfUrl(`/api/serve-pdf/${filename}`);
    }
  }, [filename]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = filename || "document.pdf";
    link.click();
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
        </div>

        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
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

          {/* Action Buttons */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="h-5 w-5" />
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-900 p-4">
        <div className="max-w-full mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
          {pdfUrl && (
            <div className="relative">
              <iframe
                src={pdfUrl}
                className="w-full h-[calc(100vh-120px)] border-0"
                title={`PDF Viewer - ${filename}`}
                style={{
                  minHeight: "600px",
                  backgroundColor: "#ffffff",
                }}
                onLoad={() => console.log("PDF loaded in full screen")}
                onError={() =>
                  console.error("PDF failed to load in full screen")
                }
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
          )}
        </div>
      </div>

      {/* Islamic Footer */}
      <div className="bg-gray-800 text-white p-4 text-center border-t border-gray-700">
        <p className="text-sm text-gray-300">
          <span className="quranic-text text-islamic-green">
            وَقُل رَّبِّ زِدْنِي عِلْمًا
          </span>
          <br />
          <span className="italic">
            "And say: My Lord, increase me in knowledge" - Quran 20:114
          </span>
        </p>
      </div>
    </div>
  );
}
