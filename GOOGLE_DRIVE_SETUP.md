# 🚀 Google Drive API Setup Guide

**FREE 15GB PDF Storage for Your Islamic Website!**

This guide will help you set up Google Drive API for free PDF storage and serving.

## 🎯 Benefits of Google Drive Integration

✅ **FREE 15GB Storage** (vs Firebase Storage which is paid)  
✅ **Fast CDN Delivery** via Google's infrastructure  
✅ **Production Ready** - works on any hosting platform  
✅ **No Size Limits** (up to 5TB per file)  
✅ **Automatic Backup** and sync across devices  
✅ **Easy Management** via Google Drive interface

---

## 📋 Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create New Project**:

   - Click "Select a project" → "New Project"
   - Project name: `Islamic-Website-Storage`
   - Click "Create"

3. **Enable Google Drive API**:
   - Go to: https://console.cloud.google.com/apis/library/drive.googleapis.com
   - Click "Enable"

---

## 🔑 Step 2: Create API Key

1. **Go to Credentials**:

   - Visit: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "API Key"

2. **Secure Your API Key**:

   - Click "Restrict Key"
   - **API restrictions**: Select "Google Drive API"
   - **Application restrictions**:
     - Choose "HTTP referrers (web sites)"
     - Add: `http://localhost:3000/*` (for development)
     - Add: `https://your-domain.com/*` (for production)
   - Click "Save"

3. **Copy Your API Key**:
   ```bash
   # Your API key will look like this:
   AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## 📁 Step 3: Create Google Drive Folder (Optional)

1. **Go to Google Drive**: https://drive.google.com/
2. **Create Folder**:

   - Click "New" → "Folder"
   - Name: `Islamic-Website-PDFs`
   - Click "Create"

3. **Get Folder ID**:

   - Open the folder
   - Copy ID from URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

4. **Make Folder Public** (Important!):
   - Right-click folder → "Share"
   - Click "Change to anyone with the link"
   - Permission: "Viewer"
   - Click "Done"

---

## ⚙️ Step 4: Update Environment Variables

1. **Edit your `.env` file**:

   ```bash
   # Replace these values with your actual API key and folder ID
   GOOGLE_DRIVE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   GOOGLE_DRIVE_FOLDER_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
   ```

2. **Restart your development server**:
   ```bash
   npm run dev
   ```

---

## 🧪 Step 5: Test the Integration

1. **Test Google Drive API**:

   ```bash
   curl http://localhost:3001/api/test-gdrive
   ```

2. **Upload a PDF**:
   - Go to: http://localhost:3001/admin/dashboard
   - Try uploading a PDF
   - Should see "Google Drive" in the upload response

---

## 🔧 Troubleshooting

### Error: "API key not valid"

- **Solution**: Check your API key restrictions
- Make sure `localhost:3000` is allowed in HTTP referrers

### Error: "Folder not found"

- **Solution**: Check folder ID and permissions
- Make sure folder is shared with "Anyone with the link"

### Error: "Permission denied"

- **Solution**: Enable Google Drive API in Cloud Console
- Check API key has Drive API enabled

---

## 🌐 Production Setup

1. **Add your domain** to API key restrictions:

   ```
   https://yourdomain.com/*
   https://www.yourdomain.com/*
   ```

2. **Update environment variables** on Vercel:

   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add `GOOGLE_DRIVE_API_KEY`
   - Add `GOOGLE_DRIVE_FOLDER_ID`

3. **Deploy and test** in production

---

## 📊 Usage Limits (FREE!)

- **Storage**: 15GB free (shared with Gmail and Photos)
- **API Calls**: 1 billion per day (free)
- **Upload Size**: Up to 5TB per file
- **Bandwidth**: Unlimited (served via Google CDN)

---

## 🔒 Security Best Practices

1. **API Key Restrictions**:

   - ✅ Restrict to Google Drive API only
   - ✅ Restrict to your domains only
   - ❌ Never commit API keys to git

2. **Folder Permissions**:

   - ✅ Set folder to "Anyone with link can view"
   - ✅ Create dedicated folder for website files
   - ❌ Don't store sensitive files in the same folder

3. **Environment Variables**:
   - ✅ Use different API keys for dev/prod
   - ✅ Store in environment variables only
   - ❌ Never hardcode keys in source code

---

## 🎉 What You Get

After setup, your Islamic website will have:

- ✅ **Free PDF storage** via Google Drive
- ✅ **Fast PDF serving** via Google CDN
- ✅ **Production-ready** deployment
- ✅ **Easy file management** via Google Drive
- ✅ **Automatic backups** and sync
- ✅ **No monthly bills** for storage

---

**Ready to set up? Follow the steps above and you'll have free, reliable PDF storage in 10 minutes!** 🚀
