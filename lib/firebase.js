import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Debug: Log environment variables to see what's being loaded
console.log("🔍 Debug: Environment variables check:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log(
  "NEXT_PUBLIC_FIREBASE_API_KEY:",
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ Loaded" : "❌ Missing"
);
console.log(
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:",
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅ Loaded" : "❌ Missing"
);
console.log(
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID:",
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ Loaded" : "❌ Missing"
);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required environment variables
const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

let app;

if (missingEnvVars.length > 0) {
  console.error("❌ Missing environment variables:", missingEnvVars);
  console.log(
    "📝 Available process.env keys:",
    Object.keys(process.env).filter((key) =>
      key.startsWith("NEXT_PUBLIC_FIREBASE")
    )
  );

  // Temporary fallback to prevent app crash - use hardcoded values for development
  console.warn("⚠️ Using fallback Firebase configuration for development");
  const fallbackConfig = {
    apiKey: "AIzaSyCwH6qMMIj-k5hsctPvbAvRfafeaK7CHtE",
    authDomain: "umar-farooq-islamic-website.firebaseapp.com",
    databaseURL:
      "https://umar-farooq-islamic-website-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "umar-farooq-islamic-website",
    storageBucket: "umar-farooq-islamic-website.firebasestorage.app",
    messagingSenderId: "156515717136",
    appId: "1:156515717136:web:06f6b556d8c67cd0563a95",
    measurementId: "G-S11G6HT1BD",
  };

  app = initializeApp(fallbackConfig);
} else {
  console.log("✅ All Firebase environment variables loaded successfully");
  app = initializeApp(firebaseConfig);
}

export const db = getFirestore(app);
export const auth = getAuth(app);
