import { MediaFile } from "./types";
import { generateId } from "./mockData";

// Get API base URL from environment or default to localhost
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export interface UploadResponse {
  success: boolean;
  mediaLink?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  error?: string;
}

export const uploadMediaFileToGoogleDrive = async (
  file: File,
): Promise<MediaFile> => {
  // Create FormData for file upload
  const formData = new FormData();
  formData.append("file", file);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${API_BASE_URL}/upload-media`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Upload failed with status ${response.status}`,
      );
    }

    const data: UploadResponse = await response.json();

    if (!data.success || !data.mediaLink) {
      throw new Error(data.error || "Upload failed - no media link received");
    }

    // Return MediaFile object matching our type system
    return {
      id: generateId(),
      name: data.fileName || file.name,
      url: data.mediaLink,
      type: data.mimeType || file.type,
      size: data.fileSize || file.size,
      uploadedAt: new Date(),
    };
  } catch (error) {
    console.error("Google Drive upload error:", error);

    // Provide user-friendly error messages
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Upload timeout. Please try with a smaller file.");
      } else if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("network") ||
        error.message.includes("NetworkError")
      ) {
        throw new Error("Unable to connect to upload service.");
      } else if (
        error.message.includes("quota") ||
        error.message.includes("limit")
      ) {
        throw new Error("Upload quota exceeded. Please try again later.");
      } else if (error.message.includes("configuration")) {
        throw new Error(
          "Upload service temporarily unavailable. Please try again later.",
        );
      } else {
        throw new Error(error.message);
      }
    }

    throw new Error("Upload failed. Please try again.");
  }
};

// Health check function to verify backend is running
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log("Backend server not available, will use mock uploads");
    return false;
  }
};

// Smart upload function with automatic fallback
export const uploadMediaFileWithFallback = async (
  file: File,
): Promise<MediaFile> => {
  // First check if we should even try the real API
  // In development/demo mode, we might want to skip this check entirely
  const isDemoMode =
    !API_BASE_URL.includes("localhost") ||
    window.location.hostname !== "localhost";

  let shouldTryRealAPI = true;

  // In demo/hosted environments, quickly check if backend is available
  if (isDemoMode) {
    try {
      // Quick health check with very short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      shouldTryRealAPI = response.ok;
    } catch {
      shouldTryRealAPI = false;
    }
  }

  // Try real upload if backend is available
  if (shouldTryRealAPI) {
    try {
      console.log("Attempting Google Drive upload...");
      return await uploadMediaFileToGoogleDrive(file);
    } catch (error) {
      console.warn("Google Drive upload failed, falling back to mock:", error);
    }
  }

  // Fallback to mock upload
  console.log("Using mock upload (backend not available or demo mode)");
  const { uploadMediaFile } = await import("./mockData");
  return uploadMediaFile(file);
};
