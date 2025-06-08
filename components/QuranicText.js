import React from "react";

// Common Quranic phrases and words that indicate Quranic content
const QURANIC_INDICATORS = [
  "بِسْمِ اللَّهِ", // Bismillah
  "الْحَمْدُ لِلَّهِ", // Alhamdulillah
  "قُلْ", // Say (common Quranic command)
  "يَا أَيُّهَا", // O you who
  "وَاللَّهُ", // And Allah
  "إِنَّ اللَّهَ", // Indeed Allah
  "سُبْحَانَ", // Glory be to
  "لَا إِلَهَ إِلَّا اللَّهُ", // La ilaha illa Allah
  "رَبَّنَا", // Our Lord
  "آمَنُوا", // Believe
  "الَّذِينَ آمَنُوا", // Those who believe
  "وَمَا", // And what
  "فَإِنَّ", // Then indeed
  "وَإِذَا", // And when
  "قَالَ اللَّهُ", // Allah said
  "نَزَّلَ", // Revealed
  "الْقُرْآنِ", // Quran
  "آيَةٍ", // Verse
  "سُورَةٍ", // Chapter
];

// Common Hadith phrases and words that indicate Hadith content
const HADITH_INDICATORS = [
  "قال رسول الله", // The Messenger of Allah said
  "عن النبي", // From the Prophet
  "صلى الله عليه وسلم", // Peace be upon him
  "رواه", // Narrated by
  "أخرجه", // Reported by
  "حدثنا", // He told us
  "أخبرنا", // He informed us
  "عن أبي هريرة", // From Abu Huraira
  "عن عائشة", // From Aisha
  "عن ابن عمر", // From Ibn Umar
  "في الصحيحين", // In the two Sahihs
  "رواه البخاري", // Narrated by Bukhari
  "رواه مسلم", // Narrated by Muslim
  "حديث صحيح", // Authentic hadith
  "حديث حسن", // Good hadith
];

// Function to detect if text contains Quranic content
const isQuranicContent = (text) => {
  if (!text || typeof text !== "string") return false;

  // Check for common Quranic indicators
  return QURANIC_INDICATORS.some((indicator) => text.includes(indicator));
};

// Function to detect if text contains Hadith content
const isHadithContent = (text) => {
  if (!text || typeof text !== "string") return false;

  // Check for common Hadith indicators
  return HADITH_INDICATORS.some((indicator) => text.includes(indicator));
};

// QuranicText component that automatically applies the right font
const QuranicText = ({
  children,
  className = "",
  forceQuranic = false,
  forceHadith = false,
  forceArabic = false,
  forceUrdu = false,
  ...props
}) => {
  const text = typeof children === "string" ? children : "";

  // Determine which font class to use
  let fontClass = "";
  if (forceQuranic || isQuranicContent(text)) {
    fontClass = "quranic-text";
  } else if (forceHadith || isHadithContent(text)) {
    fontClass = "hadith-text";
  } else if (forceUrdu) {
    fontClass = "urdu-text";
  } else if (forceArabic) {
    fontClass = "arabic-text";
  } else {
    // Auto-detect: if it contains Arabic characters, use Arabic font
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    fontClass = hasArabic ? "arabic-text" : "";
  }

  const combinedClassName = `${fontClass} ${className}`.trim();

  return (
    <span className={combinedClassName} {...props}>
      {children}
    </span>
  );
};

// QuranicContent component for longer content blocks
const QuranicContent = ({
  children,
  className = "",
  forceQuranic = false,
  forceHadith = false,
  forceArabic = false,
  forceUrdu = false,
  ...props
}) => {
  const text = typeof children === "string" ? children : "";

  // Determine which font class to use
  let fontClass = "";
  if (forceQuranic || isQuranicContent(text)) {
    fontClass = "quranic-content";
  } else if (forceHadith || isHadithContent(text)) {
    fontClass = "hadith-content";
  } else if (forceUrdu) {
    fontClass = "urdu-content";
  } else if (forceArabic) {
    fontClass = "arabic-content";
  } else {
    // Auto-detect: if it contains Arabic characters, use Arabic content font
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    fontClass = hasArabic ? "arabic-content" : "";
  }

  const combinedClassName = `${fontClass} ${className}`.trim();

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

// HadithText component specifically for Hadith
const HadithText = ({ children, className = "", ...props }) => {
  return (
    <span className={`hadith-text ${className}`} {...props}>
      {children}
    </span>
  );
};

// HadithContent component for longer Hadith blocks
const HadithContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`hadith-content ${className}`} {...props}>
      {children}
    </div>
  );
};

// UrduText component specifically for Urdu
const UrduText = ({ children, className = "", ...props }) => {
  return (
    <span className={`urdu-text ${className}`} {...props}>
      {children}
    </span>
  );
};

// UrduContent component for longer Urdu blocks
const UrduContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`urdu-content ${className}`} {...props}>
      {children}
    </div>
  );
};

export {
  QuranicText,
  QuranicContent,
  HadithText,
  HadithContent,
  UrduText,
  UrduContent,
  isQuranicContent,
  isHadithContent,
};
export default QuranicText;
