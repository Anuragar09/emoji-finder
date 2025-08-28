import { useParams, useNavigate } from 'react-router-dom';
import { GameMode } from '@/types/game';
import GameBoard from '@/components/GameBoard';

const Game = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();

  const gameMode = mode as GameMode;

  if (!gameMode || !['emoji', 'number', 'alphabet', 'shape'].includes(gameMode)) {
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
      onExit={handleExit}
      onHome={handleHome}
    />
  );
};

export default Game;