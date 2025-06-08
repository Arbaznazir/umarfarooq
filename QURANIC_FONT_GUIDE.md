# 🕌 Al Majeed Quranic Font Implementation Guide

## Overview

Your Islamic Studies website now uses the **Al Majeed Quranic Font** specifically for Quranic texts, providing authentic and beautiful rendering of Quranic verses while maintaining readability and Islamic aesthetics.

## 📁 Font File Location

The font file is located at:

```
/public/Al Majeed Quranic Font_shiped.ttf
```

## 🎨 CSS Classes Available

### 1. **Quranic Text Classes**

- `.quranic-text` - For Quranic verses (centered, larger line height)
- `.quranic-content` - For longer Quranic content blocks (right-aligned, optimized for reading)

### 2. **General Arabic Text Classes**

- `.arabic-text` - For general Arabic text (names, titles, etc.)
- `.arabic-content` - For general Arabic content blocks

### 3. **Tailwind Font Classes**

- `font-quranic` - Tailwind utility class for Al Majeed font

## 🔧 Technical Implementation

### Font Face Declaration

```css
@font-face {
  font-family: "Al Majeed Quranic";
  src: url("/Al Majeed Quranic Font_shiped.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

### CSS Classes

```css
.quranic-text {
  font-family: "Al Majeed Quranic", "Noto Naskh Arabic", serif;
  direction: rtl;
  text-align: center;
  line-height: 2.2;
  letter-spacing: 0.05em;
  font-feature-settings: "liga" 1, "dlig" 1, "kern" 1;
  text-rendering: optimizeLegibility;
}

.quranic-content {
  font-family: "Al Majeed Quranic", "Noto Naskh Arabic", serif;
  direction: rtl;
  text-align: right;
  line-height: 2.5;
  letter-spacing: 0.05em;
  font-feature-settings: "liga" 1, "dlig" 1, "kern" 1;
  text-rendering: optimizeLegibility;
}
```

## 🚀 Smart Component Usage

### QuranicText Component

The website includes an intelligent `QuranicText` component that automatically detects Quranic content:

```jsx
import { QuranicText, QuranicContent } from "../components/QuranicText";

// Automatic detection
<QuranicText>{arabicText}</QuranicText>

// Force Quranic font
<QuranicText forceQuranic={true}>{arabicText}</QuranicText>

// Force regular Arabic font
<QuranicText forceArabic={true}>{arabicText}</QuranicText>
```

### Auto-Detection Features

The component automatically detects Quranic content based on common indicators:

- بِسْمِ اللَّهِ (Bismillah)
- الْحَمْدُ لِلَّهِ (Alhamdulillah)
- قُلْ (Say - common Quranic command)
- يَا أَيُّهَا (O you who)
- رَبَّنَا (Our Lord)
- And many more Quranic phrases

## 📍 Current Implementation

### 1. **Homepage (`pages/index.js`)**

- ✅ Bismillah in hero section
- ✅ Quranic quote in footer
- ✅ Arabic post previews (auto-detected)

### 2. **Post Page (`pages/post/[id].js`)**

- ✅ Bismillah header
- ✅ Arabic post content (auto-detected)
- ✅ Quranic footer quote

### 3. **Categories Page (`pages/categories.js`)**

- ✅ Quranic verse quote

### 4. **Category Page (`pages/category/[id].js`)**

- ✅ Bismillah in header
- ✅ Arabic post previews (auto-detected)

## 📝 Sample Quranic Content

The database now includes sample Arabic posts with authentic Quranic content:

### 1. **Surah Al-Fatiha**

```arabic
بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
الرَّحْمَٰنِ الرَّحِيمِ
مَالِكِ يَوْمِ الدِّينِ
إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ
صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ
```

### 2. **Ayat al-Kursi**

```arabic
اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ
```

## 🎯 Usage Guidelines

### When to Use Quranic Font

- ✅ Direct Quranic verses
- ✅ Bismillah
- ✅ Quranic supplications (duas from Quran)
- ✅ Quranic chapter/verse references

### When to Use Regular Arabic Font

- ✅ Names and titles (عمر فاروق المدنی)
- ✅ General Arabic text
- ✅ Hadith text (unless it contains Quranic quotes)
- ✅ Arabic descriptions and explanations

## 🔄 Adding New Quranic Content

### Manual Implementation

```jsx
// For Quranic verses
<p className="quranic-text text-2xl text-islamic-green">
  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
</p>

// For longer Quranic content
<div className="quranic-content text-xl leading-loose">
  {quranicContent}
</div>
```

### Using Smart Component

```jsx
// Automatic detection
<QuranicContent className="text-xl text-gray-700">
  {arabicContent}
</QuranicContent>

// Force Quranic font for specific content
<QuranicText forceQuranic={true} className="text-2xl text-islamic-green">
  {arabicText}
</QuranicText>
```

## 🎨 Styling Options

### Text Sizes

- `text-sm` - Small Quranic text
- `text-lg` - Regular Quranic text
- `text-xl` - Large Quranic text
- `text-2xl` - Extra large for verses
- `text-3xl` - Hero-sized Quranic text

### Colors

- `text-islamic-green` - Primary Islamic green
- `text-gray-700` - Standard text color
- `text-white` - For dark backgrounds

### Responsive Design

```jsx
<h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl quranic-text">
  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
</h2>
```

## 🌟 Font Features

### Typography Features

- **Ligatures**: Enabled for proper Arabic text rendering
- **Kerning**: Optimized letter spacing
- **Text Rendering**: Optimized for legibility
- **Font Display**: Swap for better performance

### Responsive Design

- Mobile-optimized line heights
- Scalable text sizes
- Touch-friendly spacing

## 🔧 Troubleshooting

### Font Not Loading

1. Check font file exists at `/public/Al Majeed Quranic Font_shiped.ttf`
2. Verify CSS `@font-face` declaration
3. Check browser console for font loading errors

### Text Not Displaying Correctly

1. Ensure `direction: rtl` is applied
2. Check `text-align` property
3. Verify proper Unicode encoding

### Performance Issues

1. Font uses `font-display: swap` for optimal loading
2. Fallback to 'Noto Naskh Arabic' if Al Majeed doesn't load
3. Consider preloading font for critical text

## 📱 Browser Support

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🤲 Islamic Considerations

### Respectful Usage

- Only use for authentic Quranic content
- Ensure proper Arabic text encoding
- Maintain reverence in presentation
- Include translations when appropriate

### Content Guidelines

- Verify Quranic text accuracy
- Include proper verse references
- Provide English translations
- Maintain Islamic etiquette

---

**May Allah (SWT) bless this implementation and make it a source of benefit for those seeking Islamic knowledge. Ameen.**

_The Al Majeed Quranic Font enhances the spiritual experience of reading Quranic verses on your Islamic Studies website._
