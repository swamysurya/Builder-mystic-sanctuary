# 🎯 Issue Tracker Application

A modern, full-featured issue tracking application with Google Drive integration for file uploads.

## ✨ Features

- **📝 Issue Management**: Submit, track, and manage issues across different categories
- **💬 Real-time Chat**: Communicate about issues with team members
- **☁️ Google Drive Integration**: Upload files directly to Google Drive with shareable links
- **🏷️ Smart Filtering**: Filter issues by status, type, priority, and more
- **📱 Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **🎨 Modern UI**: Beautiful, accessible design with dark mode support
- **🔄 Smart Fallback**: Automatic fallback to demo mode when backend is unavailable

## 🚀 Quick Start

### Frontend Only (Demo Mode)

```bash
npm install
npm run dev:client
```

The app will run in demo mode with mock file uploads.

### Full Setup with Google Drive

```bash
npm install

# 1. Set up Google Drive API (see GOOGLE_DRIVE_SETUP.md)
# 2. Configure your .env file with credentials
# 3. Start both frontend and backend

# Terminal 1: Start backend
node start-backend.js

# Terminal 2: Start frontend
npm run dev:client
```

## 📁 Project Structure

```
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── IssueSubmissionForm.tsx
│   │   ├── IssuesList.tsx
│   │   ├── ChatInterface.tsx
│   │   └── UploadStatusIndicator.tsx
│   ├── lib/                 # Utilities and types
│   │   ├── types.ts         # TypeScript type definitions
│   │   ├── mockData.ts      # Mock data generators
│   │   └── googleDriveUpload.ts # Google Drive integration
│   └── pages/               # Route components
│       └── Index.tsx        # Main application
├── server/
│   └── index.js            # Express backend server
├── .env.example            # Environment variables template
├── GOOGLE_DRIVE_SETUP.md   # Google Drive setup guide
└── start-backend.js        # Backend startup script
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Server Configuration
PORT=3001

# Google Drive API (see GOOGLE_DRIVE_SETUP.md)
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account-key.json

# Optional: Upload to specific folder
GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# Frontend API URL
VITE_API_BASE_URL=http://localhost:3001
```

### Google Drive Setup

See [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md) for complete instructions on:

- Creating a Google Cloud project
- Enabling Google Drive API
- Setting up service account authentication
- Configuring file permissions

## 🎮 Usage

### Issue Types

**Content Issues**

- Blog posts, social media content
- Marketing materials
- Content strategy requests

**Technical Issues**

- Bug reports
- System problems
- Feature requests

**General Requests**

- Account access
- Policy questions
- Training requests

### File Uploads

The application supports uploading:

- **Images**: JPEG, PNG, GIF, WebP (up to 50MB)
- **Videos**: MP4, WebM, QuickTime (up to 50MB)
- **Documents**: PDF, DOC, DOCX, TXT (up to 50MB)

### Upload Modes

**🟢 Google Drive Mode** (when backend is running)

- Files uploaded to Google Drive
- Shareable public links generated
- Permanent storage

**🔵 Demo Mode** (backend not available)

- Mock file uploads for testing
- Simulated Google Drive links
- Data stored locally

## 🛠️ Development

### Scripts

```bash
npm run dev:client        # Start frontend only
npm run dev               # Start both frontend and backend (requires concurrently)
npm run build            # Build for production
npm run test             # Run tests
npm run typecheck        # TypeScript type checking
npm run format.fix       # Format code with Prettier
```

### Backend Development

Start the backend server independently:

```bash
node start-backend.js
```

The backend provides:

- `POST /upload-media` - File upload endpoint
- `GET /health` - Server health check

### API Integration

The frontend automatically detects backend availability:

```typescript
// Real upload (when backend available)
const file = await uploadMediaFileToGoogleDrive(file);

// Automatic fallback to mock
const file = await uploadMediaFileWithFallback(file);
```

## 🔒 Security

- Service account authentication for Google Drive
- File type and size validation
- CORS protection
- No sensitive data in frontend
- Automatic public link generation

## �� Troubleshooting

### Common Issues

**"Failed to fetch" errors**

- Backend server not running
- Check console for server status
- App will automatically fall back to demo mode

**Google Drive upload failures**

- Verify service account credentials
- Check Google Drive API is enabled
- Ensure proper folder permissions

**File upload limits**

- Maximum 50MB per file
- Check supported file types
- Verify Google Drive quota

### Debug Mode

Check upload status:

- Look for status indicator in upload section
- Check browser console for detailed logs
- Visit `/health` endpoint to verify backend

## 📚 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express
- **File Upload**: Multer, Google Drive API
- **State**: React Hook Form, Local Storage
- **Icons**: Lucide React
- **Date**: date-fns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
