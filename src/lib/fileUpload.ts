// File upload utility for handling server-side file storage

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  fileId?: string;
}

interface FileUploadData {
  file: File;
  projectId: string;
  reviewId?: string;
}

/**
 * Upload a file to the server and get back a proper URL
 * URL structure: app_url/uploads/project_id/date/filename
 */
export async function uploadFileToServer(
  data: FileUploadData,
): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("projectId", data.projectId);
    if (data.reviewId) {
      formData.append("reviewId", data.reviewId);
    }

    // Add timestamp for folder structure
    const now = new Date();
    const dateFolder = now.toISOString().split("T")[0]; // YYYY-MM-DD format
    formData.append("dateFolder", dateFolder);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("File upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Get the expected URL structure for uploaded files
 */
export function getUploadUrl(
  projectId: string,
  date: string,
  filename: string,
): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/uploads/${projectId}/${date}/${encodeURIComponent(filename)}`;
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const validTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "application/pdf",
  ];

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error:
        "Invalid file type. Please upload PNG, JPG, JPEG, WebP, BMP, TIFF, or PDF files.",
    };
  }

  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size too large. Maximum size is 50MB.",
    };
  }

  return { valid: true };
}

/**
 * Create a database record for the uploaded file
 */
export async function createFileRecord(data: {
  fileId: string;
  projectId: string;
  reviewId?: string;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  url: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/files", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create file record: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("File record creation error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create file record",
    };
  }
}

/**
 * Get files associated with a project
 */
export async function getProjectFiles(projectId: string): Promise<{
  success: boolean;
  files?: Array<{
    id: string;
    filename: string;
    originalName: string;
    fileType: string;
    fileSize: number;
    url: string;
    uploadedAt: string;
  }>;
  error?: string;
}> {
  try {
    const response = await fetch(
      `/api/files?projectId=${encodeURIComponent(projectId)}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch project files: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Get project files error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch project files",
    };
  }
}

/**
 * Delete a file from the server and database
 */
export async function deleteFile(
  fileId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/files/${fileId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("File deletion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete file",
    };
  }
}
