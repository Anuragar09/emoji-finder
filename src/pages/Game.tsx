import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameMode } from '@/types/game';
import GameBoard from '@/components/GameBoard';

const Game = () => {
  const { mode, level } = useParams<{ mode: string; level: string }>();
  const navigate = useNavigate();

  const gameMode = mode as GameMode;
  const levelNum = Number(level);

  const validMode = gameMode && ['emoji', 'number', 'alphabet', 'shape'].includes(gameMode);
  const validLevel = Number.isFinite(levelNum) && levelNum >= 1 && levelNum <= 100;

  useEffect(() => {
    document.title = validMode ? `Play ${gameMode} • Emoji Finder` : 'Emoji Finder';
  }, [validMode, gameMode]);

  if (!validMode || !validLevel) {
    navigate('/');
    return null;
  }

  const handleExit = () => {
    navigate('/');
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <GameBoard 
      mode={gameMode} 
      initialLevel={levelNum}
      onExit={handleExit}
      onHome={handleHome}
    />
  );
};

export default Game;