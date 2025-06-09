# 🔧 Google Drive Integration Setup Guide

This guide will help you set up Google Drive integration for your Islamic website to store PDF files **for FREE** (15GB storage).

## 🎯 Why Google Drive?

- ✅ **FREE 15GB storage** (vs Firebase Storage being paid)
- ✅ **Fast CDN delivery** via Google's infrastructure
- ✅ **Production ready** - works on any hosting platform
- ✅ **No size limits** (up to 5TB per file)
- ✅ **Easy management** via Google Drive interface
- ✅ **Automatic backup** and sync across devices

---

## 📋 Prerequisites

- Google Account
- Access to Google Cloud Console
- Your Next.js project with environment variables

---

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** or select existing project
3. Enter project name: `Islamic Website Storage`
4. Click **"Create"**

### Step 2: Enable Google Drive API

1. In Google Cloud Console, go to **"APIs & Services" > "Library"**
2. Search for **"Google Drive API"**
3. Click on **"Google Drive API"**
4. Click **"Enable"**

### Step 3: Create Service Account (Required for File Uploads)

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"Service account"**
4. Fill in details:
   - **Service account name:** `islamic-website-drive`
   - **Service account ID:** `islamic-website-drive` (auto-filled)
   - **Description:** `Service account for PDF uploads to Google Drive`
5. Click **"Create and Continue"**
6. **Grant this service account access to project:**
   - Select role: **"Editor"** (or **"Storage Admin"** for minimal permissions)
7. Click **"Continue"** then **"Done"**

### Step 4: Generate Service Account Key

1. In **"Credentials"** page, find your service account
2. Click on the service account email
3. Go to **"Keys"** tab
4. Click **"Add Key" > "Create new key"**
5. Select **"JSON"** format
6. Click **"Create"**
7. **Download the JSON file** (keep it secure!)

### Step 5: Extract Credentials from JSON

Open the downloaded JSON file. You'll need:

- `client_email` (Service Account Email)
- `private_key` (Service Account Private Key)

### Step 6: Create Google Drive Folder (Optional)

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder: **"Islamic Website PDFs"**
3. Open the folder and copy the **Folder ID** from URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```

### Step 7: Share Folder with Service Account

1. Right-click your folder in Google Drive
2. Click **"Share"**
3. Add your **service account email** (from JSON file)
4. Set permission to **"Editor"**
5. Click **"Send"**

---

## 🔐 Environment Variables Setup

Add these to your `.env` file:

```env
# =============================================================================
# GOOGLE DRIVE CONFIGURATION (Service Account Authentication)
# =============================================================================

# Service Account Email (from JSON file: client_email)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Service Account Private Key (from JSON file: private_key)
# Note: Keep the quotes and \n characters as they are
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"

# Google Drive Folder ID (Optional - folder where PDFs will be stored)
# If not set, files will be stored in the root of the service account's accessible drive
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id_here
```

### 🔒 Important Security Notes:

- **Never commit** the JSON file to your repository
- **Keep the private key secure** - treat it like a password
- **Use environment variables** for all credentials
- **Add .env to .gitignore**

---

## 🧪 Testing the Setup

1. **Restart your development server:**

   ```bash
   npm run dev
   ```

2. **Test the connection:**

   - Go to: `http://localhost:3000/api/test-gdrive`
   - You should see: `✅ Google Drive API is working correctly!`

3. **Test file upload:**
   - Go to: `http://localhost:3000/admin/dashboard`
   - Try uploading a PDF
   - Check your Google Drive folder for the uploaded file

---

## 🎯 Production Deployment

### For Vercel:

```bash
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL
vercel env add GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
vercel env add GOOGLE_DRIVE_FOLDER_ID
```

### For other platforms:

Add the environment variables through your hosting platform's dashboard.

---

## 🔍 Troubleshooting

### ❌ "Service Account not initialized"

- Check if `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` are set
- Verify the private key format (should include `\n` characters)

### ❌ "Permission denied" errors

- Ensure the service account has access to your Google Drive folder
- Check if the folder ID is correct
- Verify the service account has "Editor" permissions

### ❌ "Invalid credentials"

- Re-download the JSON file from Google Cloud Console
- Copy the exact values from the JSON file
- Ensure no extra spaces or characters in environment variables

### ❌ File uploads failing

- Check Google Drive API is enabled
- Verify service account has proper scopes
- Test with a smaller file first

---

## 📚 Additional Resources

- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)
- [Service Account Authentication](https://cloud.google.com/docs/authentication/service-accounts)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## 🎉 Success!

Once configured, your Islamic website will:

- ✅ Upload PDFs directly to Google Drive
- ✅ Serve files via Google's fast CDN
- ✅ Use FREE storage (15GB limit)
- ✅ Work in production without any issues
- ✅ Provide reliable file delivery worldwide

**Enjoy your FREE Google Drive storage!** 🚀
