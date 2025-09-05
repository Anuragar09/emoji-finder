import React from 'react';

interface InterstitialAdProps {
  adUnitId: string;
  onAdClosed?: () => void;
  onAdFailed?: () => void;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const InterstitialAd: React.FC<InterstitialAdProps> = ({ 
  adUnitId, 
  onAdClosed,
  onAdFailed
}) => {
  const showInterstitialAd = () => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        // For web, we'll simulate an interstitial ad
        // In a real implementation, you would use AdMob's web SDK
        console.log('Showing interstitial ad:', adUnitId);
        
        // Simulate ad display
        setTimeout(() => {
          console.log('Interstitial ad closed');
          onAdClosed?.();
        }, 2000);
      } else {
        onAdFailed?.();
      }
    } catch (error) {
      console.error('Interstitial ad error:', error);
      onAdFailed?.();
    }
  };

  // Auto-trigger the ad when component mounts
  React.useEffect(() => {
    showInterstitialAd();
  }, []);

  return null;
};

export default InterstitialAd;