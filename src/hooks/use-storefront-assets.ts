import { useState, useCallback } from 'react';
import { storefrontService } from '../services/storefront.service';

export function useStorefrontAssets() {
  const [uploadingType, setUploadingType] = useState<'logo' | 'banner' | null>(null);
  const [assetError, setAssetError] = useState<string | null>(null);

  const clearAssetError = useCallback(() => setAssetError(null), []);

  const uploadLogo = useCallback(async (file: File) => {
    setUploadingType('logo');
    setAssetError(null);
    try {
      const result = await storefrontService.uploadLogo(file);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Logo upload failed';
      setAssetError(msg);
      throw err;
    } finally {
      setUploadingType(null);
    }
  }, []);

  const deleteLogo = useCallback(async () => {
    setAssetError(null);
    const result = await storefrontService.deleteLogo();
    return result;
  }, []);

  const uploadBanner = useCallback(async (file: File) => {
    setUploadingType('banner');
    setAssetError(null);
    try {
      const result = await storefrontService.uploadBanner(file);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Banner upload failed';
      setAssetError(msg);
      throw err;
    } finally {
      setUploadingType(null);
    }
  }, []);

  const deleteBanner = useCallback(async () => {
    setAssetError(null);
    const result = await storefrontService.deleteBanner();
    return result;
  }, []);

  return {
    uploadLogo,
    deleteLogo,
    uploadBanner,
    deleteBanner,
    isUploading: uploadingType !== null,
    uploadingType,
    assetError,
    clearAssetError,
  };
}
