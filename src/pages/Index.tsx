import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SplashScreen from '@/components/SplashScreen';
import GameTabs from '@/components/GameTabs';
import { GameMode } from '@/types/game';

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleGameSelect = (mode: GameMode) => {
    navigate(`/game/${mode}`);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return <GameTabs onGameSelect={handleGameSelect} />;
};

export default Index;
