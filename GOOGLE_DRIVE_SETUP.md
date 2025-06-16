# Google Drive API Setup Guide

This guide will help you set up Google Drive API integration for file uploads in your Issue Tracker application.

## 📋 Prerequisites

- Google Cloud Console account
- Node.js installed
- Project dependencies installed (`npm install`)

## 🔧 Setup Steps

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 2. Enable Google Drive API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click on it and press **Enable**

### 3. Create a Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in the service account details:
   - **Name**: `issue-tracker-drive-uploader` (or any name you prefer)
   - **Description**: `Service account for uploading files to Google Drive`
4. Click **Create and Continue**
5. For roles, add **Editor** or **Storage Admin** (or create a custom role with minimal permissions)
6. Click **Continue** and then **Done**

### 4. Generate Service Account Key

1. In the **Credentials** page, find your service account
2. Click on it to open details
3. Go to the **Keys** tab
4. Click **Add Key** → **Create New Key**
5. Choose **JSON** format
6. Download the key file and save it securely (e.g., `service-account-key.json`)

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your configuration:

   **Option A: Using Service Account Key File (Recommended)**

   ```env
   PORT=3001
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account-key.json
   ```

   **Option B: Using Environment Variables**

   ```env
   PORT=3001
   GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
   GOOGLE_CLIENT_ID=your-client-id
   ```

3. **Optional**: Create a specific Google Drive folder for uploads:
   - Create a folder in your Google Drive
   - Get the folder ID from the URL (the long string after `/folders/`)
   - Add it to your `.env`:
     ```env
     GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
     ```

### 6. Share Drive Folder (if using specific folder)

If you're using a specific folder for uploads:

1. Right-click the folder in Google Drive
2. Click **Share**
3. Add your service account email (found in the JSON key file)
4. Give it **Editor** permissions
5. Click **Send**

## 🚀 Running the Application

1. Start both frontend and backend:

   ```bash
   npm run dev
   ```

   This will start:

   - Frontend on `http://localhost:5173`
   - Backend on `http://localhost:3001`

2. Test the upload functionality by submitting an issue with file attachments

## 🔍 Troubleshooting

### Common Issues

1. **"Google Drive not initialized"**

   - Check that your service account key file path is correct
   - Verify the JSON key file is valid
   - Ensure environment variables are properly set

2. **"Permission denied" errors**

   - Make sure the service account has proper permissions
   - If using a specific folder, ensure it's shared with the service account
   - Check that the Google Drive API is enabled

3. **"Upload failed" errors**
   - Check server logs for detailed error messages
   - Verify network connectivity
   - Ensure file size is under 50MB limit

### Health Check

You can check if the backend is properly configured by visiting:

```
http://localhost:3001/health
```

This will return the server status and Google Drive initialization status.

### Debug Mode

For detailed logging, check the server console when uploading files. Error messages will help identify configuration issues.

## 🔒 Security Notes

- Never commit your service account key file to version control
- Add `service-account-key.json` to your `.gitignore` file
- Use environment variables for production deployments
- Regularly rotate your service account keys
- Use minimal required permissions for the service account

## 📁 File Upload Limits

- **Maximum file size**: 50MB per file
- **Supported formats**:
  - Images: JPEG, PNG, GIF, WebP
  - Videos: MP4, WebM, QuickTime
  - Documents: PDF, DOC, DOCX, TXT

## 🔗 Useful Links

- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Service Account Authentication](https://cloud.google.com/docs/authentication/production)
