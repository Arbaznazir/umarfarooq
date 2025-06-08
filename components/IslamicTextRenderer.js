import React from "react";

// Helper function to detect if Arabic text is Quranic or Hadith
const detectArabicType = (text) => {
  // Check for Quranic indicators
  const quranicIndicators = [
    "بِسْمِ اللَّهِ",
    "الْحَمْدُ لِلَّهِ",
    "قُلْ",
    "يَا أَيُّهَا",
    "وَاللَّهُ",
    "إِنَّ اللَّهَ",
    "رَبَّنَا",
    "آمَنُوا",
    "الرَّحْمَـٰنِ الرَّحِيمِ",
    "مَالِكِ يَوْمِ الدِّينِ",
    "إِيَّاكَ نَعْبُدُ",
    "اهْدِنَا الصِّرَاطَ",
  ];

  // Check for Hadith indicators
  const hadithIndicators = [
    "قال رسول الله",
    "عن النبي",
    "صلى الله عليه وسلم",
    "رواه",
    "أخرجه",
    "حدثنا",
    "أخبرنا",
    "عن أبي",
    "عن عائشة",
    "عن ابن",
  ];

  const isQuranic = quranicIndicators.some((indicator) =>
    text.includes(indicator)
  );
  const isHadith = hadithIndicators.some((indicator) =>
    text.includes(indicator)
  );

  if (isQuranic) return "quran";
  if (isHadith) return "hadith";
  return "quran"; // Default to Quranic for Arabic text
};

// Enhanced text parsing for admin markers
const parseIslamicText = (text) => {
  if (!text || typeof text !== "string")
    return [{ type: "text", content: text || "" }];

  const segments = [];
  let currentIndex = 0;

  // Regex patterns for different markers (order matters - specific patterns first)
  const patterns = [
    { type: "quran", regex: /\/\/\/quran\s+(.*?)\s*\/\/\//gs },
    { type: "hadith", regex: /\/\/\/hadith\s+(.*?)\s*\/\/\//gs },
    { type: "urdu", regex: /\/\/\/urdu\s+(.*?)\s*\/\/\//gs },
    // Auto-detection pattern for direct Arabic text (must not start with keywords)
    {
      type: "auto-arabic",
      regex:
        /\/\/\/(?!(?:quran|hadith|urdu)\s)([^\/]*[\u0600-\u06FF][^\/]*?)\/\/\//gs,
    },
  ];

  // Find all matches for all patterns
  const allMatches = [];

  patterns.forEach((pattern) => {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);

    while ((match = regex.exec(text)) !== null) {
      allMatches.push({
        type: pattern.type,
        content: match[1].trim(),
        start: match.index,
        end: match.index + match[0].length,
        fullMatch: match[0],
      });
    }
  });

  // Sort matches by start position
  allMatches.sort((a, b) => a.start - b.start);

  // Build segments
  allMatches.forEach((match) => {
    // Add text before the match
    if (currentIndex < match.start) {
      const beforeText = text.slice(currentIndex, match.start).trim();
      if (beforeText) {
        segments.push({ type: "text", content: beforeText });
      }
    }

    // Add the matched segment
    let segmentType = match.type;
    let segmentContent = match.content;

    // Handle auto-arabic detection
    if (match.type === "auto-arabic") {
      segmentType = detectArabicType(match.content);
      segmentContent = match.content.trim();
    }

    segments.push({
      type: segmentType,
      content: segmentContent,
    });

    currentIndex = match.end;
  });

  // Add remaining text
  if (currentIndex < text.length) {
    const remainingText = text.slice(currentIndex).trim();
    if (remainingText) {
      segments.push({ type: "text", content: remainingText });
    }
  }

  // If no matches found, return the original text
  if (segments.length === 0) {
    segments.push({ type: "text", content: text });
  }

  return segments;
};

// Component to render individual segments
const TextSegment = ({ segment, className = "" }) => {
  const { type, content } = segment;

  switch (type) {
    case "quran":
      return (
        <div className={`rendered-quran ${className}`}>
          <div className="text-sm text-islamic-green font-semibold mb-2 font-sans">
            📖 Quranic Verse
          </div>
          <div className="quranic-text text-lg md:text-xl">{content}</div>
        </div>
      );

    case "hadith":
      return (
        <div className={`rendered-hadith ${className}`}>
          <div className="text-sm text-amber-700 font-semibold mb-2 font-sans">
            📜 Hadith
          </div>
          <div className="hadith-text text-lg md:text-xl">{content}</div>
        </div>
      );

    case "urdu":
      return (
        <div className={`rendered-urdu ${className}`}>
          <div className="text-sm text-blue-700 font-semibold mb-2 font-sans">
            🇵🇰 Urdu Text
          </div>
          <div className="urdu-text text-lg md:text-xl">{content}</div>
        </div>
      );

    case "auto-arabic":
      // This should not happen as we convert it, but just in case
      const detectedType = detectArabicType(content);
      return (
        <TextSegment
          segment={{ type: detectedType, content }}
          className={className}
        />
      );

    default:
      return (
        <div
          className={`text-gray-700 leading-relaxed whitespace-pre-wrap ${className}`}
        >
          {content}
        </div>
      );
  }
};

// Main Islamic Text Renderer Component
const IslamicTextRenderer = ({
  text,
  className = "",
  showMarkers = false,
  isPreview = false,
}) => {
  const segments = parseIslamicText(text);

  if (isPreview) {
    // Preview mode for admin - show markers
    return (
      <div className={`admin-editor ${className}`}>
        {segments.map((segment, index) => (
          <div key={index} className="mb-4">
            {segment.type !== "text" && (
              <div className={`${segment.type}-marker`}>
                <strong>
                  {segment.type === "quran" && "📖 Quran: "}
                  {segment.type === "hadith" && "📜 Hadith: "}
                  {segment.type === "urdu" && "🇵🇰 Urdu: "}
                  {segment.type === "auto-arabic" && "🔍 Auto-detected: "}
                </strong>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {segment.type === "auto-arabic"
                    ? `///${segment.content}///`
                    : `///${segment.type} ${segment.content} ///`}
                </span>
              </div>
            )}
            <TextSegment segment={segment} />
          </div>
        ))}
      </div>
    );
  }

  // Normal rendering mode
  return (
    <div className={className}>
      {segments.map((segment, index) => (
        <TextSegment key={index} segment={segment} className="mb-4" />
      ))}
    </div>
  );
};

// Admin Text Editor Helper Component
const AdminTextHelper = () => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-gray-800 mb-3">
        📝 Text Formatting Guide
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono text-xs">
            ///quran Your Quranic verse here ///
          </span>
          <span className="text-gray-600">→ Al Majeed Quranic Font</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded font-mono text-xs">
            ///hadith Your Hadith text here ///
          </span>
          <span className="text-gray-600">→ Neirizi Font</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-xs">
            ///urdu Your Urdu text here ///
          </span>
          <span className="text-gray-600">→ Jameel Noori Nastaleeq Font</span>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-2">
            <strong>✨ Quick Format (Auto-Detection):</strong>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono text-xs">
              ///ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ///
            </span>
            <span className="text-gray-600">→ Auto-detects Quran/Hadith</span>
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        💡 You can use either format: specify the type (quran/hadith/urdu) or
        let the system auto-detect Arabic text.
      </div>
    </div>
  );
};

// Enhanced QuranicText component with new features
const EnhancedIslamicText = ({
  children,
  className = "",
  forceQuranic = false,
  forceHadith = false,
  forceUrdu = false,
  forceArabic = false,
  ...props
}) => {
  const text = typeof children === "string" ? children : "";

  // Check for admin markers first
  if (text.includes("///")) {
    return <IslamicTextRenderer text={text} className={className} {...props} />;
  }

  // Determine which font class to use
  let fontClass = "";
  if (forceQuranic) {
    fontClass = "quranic-text";
  } else if (forceHadith) {
    fontClass = "hadith-text";
  } else if (forceUrdu) {
    fontClass = "urdu-text";
  } else if (forceArabic) {
    fontClass = "arabic-text";
  } else {
    // Auto-detect based on content
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    if (hasArabic) {
      // Check for Quranic indicators
      const quranicIndicators = [
        "بِسْمِ اللَّهِ",
        "الْحَمْدُ لِلَّهِ",
        "قُلْ",
        "يَا أَيُّهَا",
        "وَاللَّهُ",
        "إِنَّ اللَّهَ",
        "رَبَّنَا",
        "آمَنُوا",
      ];

      // Check for Hadith indicators
      const hadithIndicators = [
        "قال رسول الله",
        "عن النبي",
        "صلى الله عليه وسلم",
        "رواه",
        "أخرجه",
        "حدثنا",
        "أخبرنا",
      ];

      const isQuranic = quranicIndicators.some((indicator) =>
        text.includes(indicator)
      );
      const isHadith = hadithIndicators.some((indicator) =>
        text.includes(indicator)
      );

      if (isQuranic) {
        fontClass = "quranic-text";
      } else if (isHadith) {
        fontClass = "hadith-text";
      } else {
        fontClass = "arabic-text";
      }
    }
  }

  const combinedClassName = `${fontClass} ${className}`.trim();

  return (
    <span className={combinedClassName} {...props}>
      {children}
    </span>
  );
};

export {
  IslamicTextRenderer,
  AdminTextHelper,
  EnhancedIslamicText,
  parseIslamicText,
};
export default IslamicTextRenderer;
