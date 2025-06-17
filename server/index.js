import express from "express";
import multer from "multer";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, and documents
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only images, videos, and documents are allowed.",
        ),
      );
    }
  },
});

// Cloudinary configuration
const initializeCloudinary = () => {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error("Cloudinary credentials not configured properly");
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    return true;
  } catch (error) {
    console.error("Failed to initialize Cloudinary:", error.message);
    return false;
  }
};

const isCloudinaryInitialized = initializeCloudinary();

// Upload file to Cloudinary
const uploadToCloudinary = async (filePath, fileName, mimeType) => {
  if (!isCloudinaryInitialized) {
    throw new Error("Cloudinary not initialized");
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto", // Automatically detect file type
      public_id: fileName.split(".")[0], // Use filename without extension as public_id
      use_filename: true,
      unique_filename: true,
    });

    return uploadResult.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    cloudinaryInitialized: isCloudinaryInitialized,
  });
});

// Upload media endpoint
app.post("/upload-media", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    if (!isCloudinaryInitialized) {
      return res.status(500).json({
        success: false,
        error: "Cloudinary not configured. Please check your credentials.",
      });
    }

    const { path: tempPath, originalname, mimetype, size } = req.file;

    console.log(
      `Uploading file: ${originalname} (${(size / 1024 / 1024).toFixed(2)} MB)`,
    );

    // Upload to Cloudinary
    const mediaLink = await uploadToCloudinary(
      tempPath,
      originalname,
      mimetype,
    );

    // Clean up temporary file
    fs.unlinkSync(tempPath);

    console.log(`File uploaded successfully: ${mediaLink}`);

    res.json({
      success: true,
      mediaLink: mediaLink,
      fileName: originalname,
      fileSize: size,
      mimeType: mimetype,
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Clean up temporary file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up temp file:", cleanupError);
      }
    }

    // Send appropriate error response
    if (
      error.message.includes("credentials") ||
      error.message.includes("not configured")
    ) {
      res.status(500).json({
        success: false,
        error: "Cloudinary configuration error. Please check server setup.",
      });
    } else if (
      error.message.includes("quota") ||
      error.message.includes("limit")
    ) {
      res.status(429).json({
        success: false,
        error: "Upload quota exceeded. Please try again later.",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Upload failed. Please try again.",
      });
    }
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large. Maximum size is 50MB.",
      });
    }
  }

  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Upload endpoint: http://localhost:${PORT}/upload-media`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);

  if (!isCloudinaryInitialized) {
    console.log(
      "⚠️  Cloudinary not initialized. Please configure credentials.",
    );
  } else {
    console.log("✅ Cloudinary initialized successfully");
  }
});
