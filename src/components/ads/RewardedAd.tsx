import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';

interface RewardedAdProps {
  adUnitId: string;
  onAdComplete?: () => void;
  onAdFailed?: () => void;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const RewardedAd: React.FC<RewardedAdProps> = ({ 
  adUnitId, 
  onAdComplete,
  onAdFailed,
  children
}) => {
  const showRewardedAd = () => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        // For web, we'll simulate a rewarded ad
        // In a real implementation, you would use AdMob's web SDK
        console.log('Showing rewarded ad:', adUnitId);
        
        // Simulate ad loading and completion
        setTimeout(() => {
          console.log('Rewarded ad completed');
          onAdComplete?.();
        }, 3000);
      } else {
        onAdFailed?.();
      }
    } catch (error) {
      console.error('Rewarded ad error:', error);
      onAdFailed?.();
    }
  };

  return (
    <Button
      onClick={showRewardedAd}
      className="space-x-2"
      variant="outline"
    >
      <Gift className="h-4 w-4" />
      {children || <span>Watch Ad for Reward</span>}
    </Button>
  );
};

export default RewardedAd;