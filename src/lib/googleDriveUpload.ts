import { MediaFile } from "./types";
import { generateId } from "./mockData";

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
    const response = await fetch(`${API_BASE_URL}/upload-media`, {
      method: "POST",
      body: formData,
    });

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
      if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        throw new Error(
          "Network error. Please check your connection and try again.",
        );
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
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error("Server health check failed:", error);
    return false;
  }
};

// Fallback to mock upload if server is not available
export const uploadMediaFileWithFallback = async (
  file: File,
): Promise<MediaFile> => {
  const isServerHealthy = await checkServerHealth();

  if (isServerHealthy) {
    try {
      return await uploadMediaFileToGoogleDrive(file);
    } catch (error) {
      console.warn("Google Drive upload failed, falling back to mock:", error);
    }
  }

  // Fallback to mock upload
  console.log("Using mock upload as fallback");
  const { uploadMediaFile } = await import("./mockData");
  return uploadMediaFile(file);
};
