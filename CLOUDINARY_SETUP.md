# Cloudinary Setup Guide

This guide will help you set up Cloudinary integration for file uploads in your Issue Tracker application.

## 📋 Prerequisites

- Cloudinary account (free tier available)
- Node.js installed
- Project dependencies installed (`npm install`)

## 🔧 Setup Steps

### 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address
4. Access your dashboard

### 2. Get Your Cloudinary Credentials

1. In the Cloudinary dashboard, you'll see your account details:
   - **Cloud Name**: Your unique cloud identifier
   - **API Key**: Your API access key
   - **API Secret**: Your secret key (keep this secure!)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Cloudinary credentials:

   ```env
   PORT=3001

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Frontend Configuration
   VITE_API_BASE_URL=http://localhost:3001
   ```

### 4. Find Your Credentials

In your Cloudinary dashboard:

- **Cloud Name**: Found in the top-left corner of the dashboard
- **API Key** and **API Secret**: Found in the "API Keys" section

Example:

```env
CLOUDINARY_CLOUD_NAME=my-awesome-app
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## 🚀 Running the Application

1. Start both frontend and backend:

   ```bash
   npm run dev
   ```

   This will start:

   - Frontend on `http://localhost:8080`
   - Backend on `http://localhost:3001`

2. Alternatively, start them separately:

   ```bash
   # Terminal 1: Start backend
   node start-backend.js

   # Terminal 2: Start frontend
   npm run dev:client
   ```

3. Test the upload functionality by submitting an issue with file attachments

## 🔍 Troubleshooting

### Common Issues

1. **"Cloudinary not initialized"**

   - Check that your credentials are correctly set in the `.env` file
   - Verify there are no extra spaces or quotes around the values
   - Ensure the `.env` file is in the root directory

2. **"Invalid API key" errors**

   - Double-check your API key and secret from the Cloudinary dashboard
   - Make sure you're using the correct cloud name
   - Verify your Cloudinary account is active

3. **"Upload failed" errors**
   - Check server logs for detailed error messages
   - Verify network connectivity
   - Ensure file size is under 50MB limit
   - Check that your Cloudinary account hasn't exceeded limits

### Health Check

You can check if the backend is properly configured by visiting:

```
http://localhost:3001/health
```

This will return:

```json
{
  "status": "OK",
  "timestamp": "2024-01-XX...",
  "cloudinaryInitialized": true
}
```

### Debug Mode

For detailed logging, check the server console when uploading files. Error messages will help identify configuration issues.

## 📁 File Upload Features

### Supported File Types

- **Images**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, WebM, QuickTime
- **Documents**: PDF, DOC, DOCX, TXT

### Upload Limits

- **Maximum file size**: 50MB per file
- **Free tier limits**:
  - 25 GB storage
  - 25 GB monthly bandwidth
  - 25,000 transformations per month

### Cloudinary Features

- **Automatic optimization**: Images are automatically optimized for web delivery
- **Format conversion**: Automatic format selection for best performance
- **CDN delivery**: Global content delivery network for fast loading
- **Transformation APIs**: Resize, crop, filter images on-the-fly (not used in this app but available)

## 🔒 Security Notes

- Never commit your API secret to version control
- Add `.env` to your `.gitignore` file (already included)
- Use environment variables for production deployments
- Consider using signed uploads for production environments
- Regularly monitor your Cloudinary usage in the dashboard

## 🎛️ Cloudinary Dashboard Features

In your Cloudinary dashboard, you can:

- **Monitor uploads**: See all uploaded files
- **Usage statistics**: Track storage and bandwidth usage
- **Asset management**: Organize files in folders
- **API monitoring**: View API usage and performance

## 🔗 Useful Links

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Guide](https://cloudinary.com/documentation/node_integration)
- [Upload API Reference](https://cloudinary.com/documentation/image_upload_api_reference)
- [Cloudinary Console](https://console.cloudinary.com/)

## 💡 Pro Tips

1. **Organize uploads**: Use folders in Cloudinary to organize your files
2. **Monitor usage**: Keep an eye on your monthly limits in the dashboard
3. **Backup important files**: Download important uploads periodically
4. **Use transformations**: Leverage Cloudinary's image transformation features for better performance

## 📈 Upgrading

If you need more storage or bandwidth:

1. Go to your Cloudinary dashboard
2. Click on "Settings" → "Account"
3. Choose a paid plan that fits your needs
4. All existing files and settings will remain intact
