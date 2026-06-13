import { useEffect, useRef } from 'react';

const AD_CLIENT = 'ca-pub-1024036460838305';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export interface AdBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  fullWidth?: boolean;
  className?: string;
}

const FORMAT_HEIGHTS: Record<string, number> = {
  rectangle: 280,
  horizontal: 100,
  vertical: 600,
  auto: 0,
};

export default function AdBanner({
  adSlot,
  adFormat = 'auto',
  fullWidth = true,
  className = '',
}: AdBannerProps) {
  // Hide until real AdSense slots are configured
  if (!adSlot || adSlot.startsWith('YOUR_AD_SLOT')) return null;

  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense block or offline — silently ignore
    }
  }, []);

  const minHeight = FORMAT_HEIGHTS[adFormat] || 0;

  return (
    <div
      className={className}
      style={{
        minHeight: minHeight ? `${minHeight}px` : undefined,
        overflow: 'hidden',
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: fullWidth ? '100%' : undefined }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidth ? 'true' : 'false'}
      />
    </div>
  );
}
