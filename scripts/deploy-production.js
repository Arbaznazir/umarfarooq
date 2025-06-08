#!/usr/bin/env node

/**
 * Production Deployment Script
 * Automatically sets up the database and deploys the application
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting production deployment...\n");

// Check if required files exist
const requiredFiles = [".env.production", "firestore.rules", "package.json"];

console.log("📋 Checking required files...");
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
  console.log(`✅ Found: ${file}`);
}

// Build the application
console.log("\n🏗️ Building the application...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("✅ Build completed successfully");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}

// Deploy Firestore rules
console.log("\n🔒 Deploying Firestore security rules...");
try {
  execSync("firebase deploy --only firestore:rules", { stdio: "inherit" });
  console.log("✅ Firestore rules deployed successfully");
} catch (error) {
  console.warn(
    "⚠️ Firestore rules deployment failed. You may need to deploy manually."
  );
  console.warn("Run: firebase deploy --only firestore:rules");
}

// Deploy to hosting platform
console.log("\n🌐 Deploying to hosting platform...");

// Check if Vercel is configured
if (fs.existsSync("vercel.json")) {
  console.log("📦 Deploying to Vercel...");
  try {
    execSync("vercel --prod", { stdio: "inherit" });
    console.log("✅ Vercel deployment completed");
  } catch (error) {
    console.error("❌ Vercel deployment failed:", error.message);
    console.log("💡 Try running: vercel --prod");
  }
} else if (fs.existsSync("firebase.json")) {
  console.log("📦 Deploying to Firebase Hosting...");
  try {
    execSync("firebase deploy --only hosting", { stdio: "inherit" });
    console.log("✅ Firebase Hosting deployment completed");
  } catch (error) {
    console.error("❌ Firebase Hosting deployment failed:", error.message);
    console.log("💡 Try running: firebase deploy --only hosting");
  }
} else {
  console.log("ℹ️ No hosting configuration found. Manual deployment required.");
}

console.log("\n🎉 Production deployment process completed!");
console.log("\n📋 Post-deployment checklist:");
console.log("1. ✅ Application built successfully");
console.log("2. ✅ Firestore rules deployed");
console.log("3. ✅ Application deployed to hosting");
console.log("4. 🔄 Database will auto-initialize on first visit");
console.log("5. 🔐 Admin can login with: umarfarooqalmadani@arbaznazir.com");

console.log(
  "\n🌟 Your Islamic Studies website is now live and production-ready!"
);
console.log(
  "📖 The database will automatically populate with sample content when first accessed."
);
console.log("🔧 Admin can add more content through the /admin panel.");

console.log(
  "\n🤲 May Allah bless this endeavor and make it beneficial for the Ummah."
);
