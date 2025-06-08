/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        quranic: ["Al Majeed Quranic", "Noto Naskh Arabic", "serif"],
        hadith: ["Neirizi", "Noto Naskh Arabic", "serif"],
        urdu: ["Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", "serif"],
        arabic: ["Noto Naskh Arabic", "serif"],
        sans: ["Inter", "sans-serif"],
        elegant: ["Playfair Display", "serif"],
      },
      colors: {
        islamic: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#047857",
          700: "#065f46",
          800: "#064e3b",
          900: "#022c22",
          green: "#047857",
          "green-light": "#10b981",
          "green-dark": "#065f46",
          gold: "#f59e0b",
          "gold-light": "#fbbf24",
          "gold-dark": "#d97706",
          dark: "#1f2937",
          "dark-light": "#374151",
          cream: "#fefdf8",
          "cream-dark": "#f7f3e9",
        },
      },
      backgroundImage: {
        "islamic-gradient":
          "linear-gradient(135deg, #1a5f3f 0%, #2d7a5f 25%, #047857 50%, #059669 75%, #10b981 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
        "premium-gradient": "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
      },
      boxShadow: {
        premium:
          "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 20px 40px -8px rgba(4, 120, 87, 0.1)",
        glow: "0 0 20px rgba(4, 120, 87, 0.3)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
