# 🎯 Issue Tracker Application

A modern, full-featured issue tracking application with Cloudinary integration for file uploads.

## ✨ Features

- **📝 Issue Management**: Submit, track, and manage issues across different categories
- **💬 Real-time Chat**: Communicate about issues with team members
- **☁️ Cloudinary Integration**: Upload files directly to Cloudinary with optimized delivery
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

### Full Setup with Cloudinary

```bash
npm install

# 1. Set up Cloudinary account (see CLOUDINARY_SETUP.md)
# 2. Configure your .env file with credentials
# 3. Start both frontend and backend

# Terminal 1: Start backend
node start-backend.js

# Terminal 2: Start frontend
npm run dev:client
```

## 📁 Project Structure

```
├─��� src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── IssueSubmissionForm.tsx
│   │   ├── IssuesList.tsx
│   │   ├── ChatInterface.tsx
│   │   └── UploadStatusIndicator.tsx
│   ├── lib/                 # Utilities and types
│   │   ├── types.ts         # TypeScript type definitions
│   │   ├── mockData.ts      # Mock data generators
│   │   └── cloudinaryUpload.ts # Cloudinary integration
│   └── pages/               # Route components
│       └── Index.tsx        # Main application
├── server/
│   └── index.js            # Express backend server
├── .env.example            # Environment variables template
├── CLOUDINARY_SETUP.md     # Cloudinary setup guide
└── start-backend.js        # Backend startup script
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Server Configuration
PORT=3001

# Cloudinary Configuration (see CLOUDINARY_SETUP.md)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend API URL
VITE_API_BASE_URL=http://localhost:3001
```

### Cloudinary Setup

See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for complete instructions on:

- Creating a Cloudinary account
- Getting your API credentials
- Configuring environment variables
- Testing the integration

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

**🟢 Cloudinary Mode** (when backend is running)

- Files uploaded to Cloudinary
- Optimized CDN delivery URLs generated
- Permanent cloud storage

**🔵 Demo Mode** (backend not available)

- Mock file uploads for testing
- Simulated Cloudinary URLs
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
const file = await uploadMediaFileToCloudinary(file);

// Automatic fallback to mock
const file = await uploadMediaFileWithFallback(file);
```

## 🔒 Security

- API key authentication for Cloudinary
- File type and size validation
- CORS protection
- No sensitive data in frontend
- Secure CDN delivery URLs

## 🚧 Troubleshooting

### Common Issues

**"Failed to fetch" errors**

- Backend server not running
- Check console for server status
- App will automatically fall back to demo mode

**Cloudinary upload failures**

- Verify API credentials in .env file
- Check Cloudinary account status
- Ensure usage limits aren't exceeded

**File upload limits**

- Maximum 50MB per file
- Check supported file types
- Verify Cloudinary usage limits

### Debug Mode

Check upload status:

- Look for status indicator in upload section
- Check browser console for detailed logs
- Visit `/health` endpoint to verify backend

## 📚 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express
- **File Upload**: Multer, Cloudinary
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
