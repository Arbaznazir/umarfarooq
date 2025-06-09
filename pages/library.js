import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  FileIcon,
  BookOpen,
} from "lucide-react";
import FaviconHead from "../components/FaviconHead";

export default function Library({ pdfFiles }) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCleanFileName = (filename) => {
    return decodeURIComponent(filename.replace(/^\d+_/, ""));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Islamic Library - PDF Documents | Umar Farooq Al Madani</title>
        <meta
          name="description"
          content="Browse and read Islamic books, research papers, and documents in our digital library."
        />
      </Head>
      <FaviconHead />

      {/* Header */}
      <header className="bg-gradient-to-r from-islamic-green to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-block bg-white/20 rounded-2xl p-4 mb-6">
              <BookOpen className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              Islamic Digital Library
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Access a collection of Islamic books, research papers, and
              scholarly documents
            </p>
            <div className="mt-8">
              <span className="quranic-text text-2xl text-white">
                وَقُل رَّبِّ زِدْنِي عِلْمًا
              </span>
              <p className="text-white/80 mt-2 italic">
                "And say: My Lord, increase me in knowledge" - Quran 20:114
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="text-islamic-green hover:text-emerald-600 font-semibold"
            >
              ← Back to Home
            </Link>
            <div className="text-sm text-gray-600">
              {pdfFiles.length} Documents Available
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {pdfFiles.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Documents Available
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              The library is currently being built. Check back soon for Islamic
              books and research papers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pdfFiles.map((file, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* PDF Preview */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-8 text-center">
                  <FileIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {getCleanFileName(file.name)}
                  </h3>
                </div>

                {/* File Info */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>PDF Document</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(file.name.split("_")[0])}</span>
                    </div>
                    {file.size && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FileIcon className="h-4 w-4 mr-2" />
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Link
                      href={`/pdf/${file.name}`}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-islamic-green text-white rounded-xl hover:bg-emerald-600 transition-colors duration-200 font-semibold"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Read
                    </Link>
                    <a
                      href={`/uploads/pdfs/${file.name}`}
                      download
                      className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              <span className="quranic-text text-islamic-green text-lg">
                إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ
              </span>
            </p>
            <p className="text-gray-400 italic">
              "Only those fear Allah, from among His servants, who have
              knowledge" - Quran 35:28
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "pdfs");

    // Check if directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      return { props: { pdfFiles: [] } };
    }

    const files = await fs.readdir(uploadsDir);
    const pdfFiles = files
      .filter((file) => file.endsWith(".pdf"))
      .map(async (file) => {
        try {
          const filePath = path.join(uploadsDir, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            size: stats.size,
          };
        } catch {
          return {
            name: file,
            size: null,
          };
        }
      });

    const resolvedFiles = await Promise.all(pdfFiles);

    // Sort by timestamp (newest first)
    resolvedFiles.sort((a, b) => {
      const timestampA = parseInt(a.name.split("_")[0]) || 0;
      const timestampB = parseInt(b.name.split("_")[0]) || 0;
      return timestampB - timestampA;
    });

    return {
      props: {
        pdfFiles: resolvedFiles,
      },
    };
  } catch (error) {
    console.error("Error reading PDF files:", error);
    return {
      props: {
        pdfFiles: [],
      },
    };
  }
}
