import { useState, useCallback } from 'react';
import { userService, type User } from '../services/user.service';

export function useProfilePhoto() {
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const clearError = useCallback(() => setPhotoError(null), []);

  const upload = useCallback(async (
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<{ url: string; user: User } | null> => {
    setIsUploading(true);
    setPhotoError(null);
    try {
      const result = await userService.uploadProfilePicture(file, onProgress);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Photo upload failed';
      setPhotoError(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const remove = useCallback(async (): Promise<boolean> => {
    setPhotoError(null);
    try {
      await userService.deleteProfilePicture();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to remove photo';
      setPhotoError(msg);
      return false;
    }
  }, []);

  return {
    upload,
    remove,
    isUploading,
    photoError,
    clearError,
  };
}
