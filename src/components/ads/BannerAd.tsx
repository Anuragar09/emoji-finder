import React, { useEffect } from 'react';

interface BannerAdProps {
  adUnitId: string;
  width?: number;
  height?: number;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const BannerAd: React.FC<BannerAdProps> = ({ 
  adUnitId, 
  width = 320, 
  height = 50 
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className="flex justify-center items-center py-2">
      <ins
        className="adsbygoogle"
        style={{
          display: 'inline-block',
          width: `${width}px`,
          height: `${height}px`,
        }}
        data-ad-client="ca-pub-9029637689395282"
        data-ad-slot={adUnitId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default BannerAd;