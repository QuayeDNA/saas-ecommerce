import { apiClient } from "@/utils/api-client";

export const uploadService = {
  /**
   * Upload an image file and return its public URL.
   * @param file  The File object from an <input type="file">
   * @param onProgress  Optional progress callback (0–100)
   */
  async uploadImage(
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<{ success: boolean; url: string }>(
      "/upload/image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      },
    );

    if (!response.data.success || !response.data.url) {
      throw new Error("Upload failed — no URL returned");
    }
    return response.data.url;
  },
};
