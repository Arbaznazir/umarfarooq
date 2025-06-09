import { useState } from "react";
import { FileText, Download, Eye, Maximize2, X } from "lucide-react";

export default function PostPDFViewer({ pdfAttachment }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!pdfAttachment) return null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const pdfUrl = `/api/serve-pdf/${pdfAttachment.filename}`;

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
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center px-3 py-2 bg-islamic-green text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 text-sm font-medium"
            >
              <Eye className="h-4 w-4 mr-2" />
              {isExpanded ? "Hide" : "View"} PDF
            </button>

            <a
              href={pdfUrl}
              download={pdfAttachment.originalName}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>

            <a
              href={`/pdf/${pdfAttachment.filename}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Full Screen
            </a>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      {isExpanded && (
        <div className="relative">
          <div className="bg-gray-100 p-4">
            {/* Simple embed approach that works in most browsers */}
            <embed
              src={pdfUrl}
              type="application/pdf"
              className="w-full h-96 rounded-lg shadow-inner"
              style={{ backgroundColor: "#ffffff" }}
            />
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
      </div>
    </div>
  );
}
