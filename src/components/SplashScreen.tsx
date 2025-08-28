import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowContinue(true), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full animate-bounce-gentle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Logo placeholder with glow */}
      <div className="mb-8 animate-glow-pulse">
        <div className="w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center text-6xl font-bold shadow-neon">
          🎯
        </div>
      </div>

      {/* App name */}
      <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 animate-fade-in">
        NEON FINDER
      </h1>
      <p className="text-xl text-muted-foreground mb-12 animate-fade-in text-center max-w-md">
        Find hidden items in this neon-powered puzzle adventure!
      </p>

      {/* Loading section */}
      <div className="w-80 space-y-4 animate-slide-up">
        <div className="text-center text-lg font-semibold text-foreground">
          Loading Game...
        </div>
        
        {/* Loading bar container */}
        <div className="h-3 bg-muted rounded-full overflow-hidden border border-border">
          <div 
            className="h-full bg-gradient-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          {loadingProgress}%
        </div>
      </div>

      {/* Continue button */}
      {showContinue && (
        <Button
          onClick={onComplete}
          className="mt-8 px-8 py-3 text-lg font-semibold bg-gradient-primary border-2 border-primary neon-glow animate-scale-in"
          size="lg"
        >
          START GAME
        </Button>
      )}

      {/* Version info */}
      <div className="absolute bottom-4 text-xs text-muted-foreground">
        v1.0.0 | Neon Finder Quest
      </div>
    </div>
  );
};

export default SplashScreen;