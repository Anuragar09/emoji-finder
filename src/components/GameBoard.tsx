import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { GameCard, GameMode, GameState, GameStats } from '@/types/game';
import { generateGameData, playSound, saveGameProgress } from '@/utils/gameUtils';
import { ArrowLeft, Heart, Timer, RotateCcw, Home, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GameBoardProps {
  mode: GameMode;
  initialLevel?: number;
  onExit: () => void;
  onHome: () => void;
}

const GameBoard = ({ mode, initialLevel = 1, onExit, onHome }: GameBoardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('playing');
  const [cards, setCards] = useState<GameCard[]>([]);
  const [target, setTarget] = useState<string>('');
  const [stats, setStats] = useState<GameStats>({
    level: initialLevel,
    lives: 3,
    timeLeft: 30,
    score: 0,
    mode
  });
  const [showHint, setShowHint] = useState(false);

  // Initialize game
  const initializeGame = useCallback(() => {
    const gameData = generateGameData(mode, stats.level);
    setCards(gameData.cards);
    setTarget(gameData.target);
    setStats(prev => ({ ...prev, timeLeft: 30 }));
    setGameState('playing');
  }, [mode, stats.level]);

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setStats(prev => {
        if (prev.timeLeft <= 1) {
          setGameState('timeout');
          handleWrongAnswer();
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardClick = (card: GameCard) => {
    if (gameState !== 'playing' || card.isSelected) return;

    // Play tap sound
    playSound('tap');

    // Add vibration feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    const updatedCards = cards.map(c => 
      c.id === card.id 
        ? { ...c, isSelected: true, state: (card.isTarget ? 'correct' : 'wrong') as 'correct' | 'wrong' }
        : c
    );
    setCards(updatedCards);

    if (card.isTarget) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };

  const handleCorrectAnswer = () => {
    setGameState('correct');
    
    // Play correct sound
    playSound('correct');
    
    // Success feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    const congratsMessages = [
      "Well done! 🎉", 
      "Congratulations! ⭐", 
      "Perfect! 🌟", 
      "Amazing! 🚀",
      "Excellent! 💫"
    ];
    
    toast({
      title: congratsMessages[Math.floor(Math.random() * congratsMessages.length)],
      description: "Moving to next level!",
      duration: 2000,
    });

    setTimeout(() => {
      setStats(prev => {
        const newLevel = prev.level + 1;
        const newScore = prev.score + (prev.timeLeft * 10);
        // Save progress: unlock next level
        saveGameProgress(newLevel, mode, newScore);
        return { ...prev, level: newLevel, score: newScore };
      });
      initializeGame();
    }, 1500);
  };

  const handleWrongAnswer = () => {
    setGameState('wrong');
    
    // Play wrong sound
    playSound('wrong');
    
    // Error vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    setStats(prev => {
      const newLives = prev.lives - 1;
      if (newLives <= 0) {
        setGameState('gameover');
        toast({
          title: "Game Over! 💀",
          description: "No lives remaining",
          variant: "destructive",
          duration: 3000,
        });
      }
      return { ...prev, lives: newLives };
    });
  };

  const handleRetry = () => {
    initializeGame();
  };

  const handleHint = () => {
    setShowHint(true);
    setTimeout(() => setShowHint(false), 2000);
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'emoji': return '😀';
      case 'number': return '🔢';
      case 'alphabet': return '🔤';
      case 'shape': return '🔶';
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'emoji': return 'from-neon-pink to-neon-purple';
      case 'number': return 'from-neon-blue to-neon-green';
      case 'alphabet': return 'from-neon-yellow to-neon-orange';
      case 'shape': return 'from-neon-green to-neon-blue';
    }
  };

  const timePercentage = (stats.timeLeft / 30) * 100;

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onExit}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="text-center">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="text-2xl">{getModeIcon()}</span>
            <span className="capitalize">{mode} Finder</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Level {stats.level} • Score: {stats.score}
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={onHome}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Home
        </Button>
      </div>

      {/* Mode Switcher */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
          {(['emoji','number','alphabet','shape'] as GameMode[]).map((m) => (
            <Button
              key={m}
              variant={m === mode ? 'default' : 'outline'}
              size="sm"
              className={`transition-all duration-300 ${m === mode ? 'shadow-neon' : ''}`}
              onClick={() => navigate(`/game/${m}/${stats.level}`)}
            >
              <span className="mr-1">{m === 'emoji' ? '😀' : m === 'number' ? '🔢' : m === 'alphabet' ? '🔤' : '🔶'}</span>
              <span className="capitalize hidden sm:inline">{m}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Game Stats */}
      <div className="max-w-md mx-auto mb-6 space-y-4">
        {/* Lives */}
        <div className="flex items-center justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <Heart 
              key={i}
              className={`w-6 h-6 ${
                i < stats.lives 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-muted-foreground'
              }`}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-lg font-semibold">
            <Timer className="w-5 h-5" />
            <span>{stats.timeLeft}s</span>
          </div>
          <Progress 
            value={timePercentage} 
            className={`h-2 ${timePercentage < 30 ? 'animate-pulse' : ''}`}
          />
        </div>

        {/* Target Display */}
        <Card className="p-4 bg-gradient-to-r from-primary/20 to-secondary/20 border-primary">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">Find this target:</div>
            <div className={`text-4xl font-bold transition-all duration-300 ${showHint ? 'animate-pulse scale-110 text-primary shadow-neon' : ''}`}>{target}</div>
          </div>
        </Card>

        {/* Hint Button */}
        <div className="text-center">
          <Button
            onClick={handleHint}
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-accent/20 to-accent/30 hover:from-accent/30 hover:to-accent/40"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Hint
          </Button>
        </div>
      </div>

      {/* Game Grid */}
      <div className="max-w-2xl mx-auto px-2">
        <div className={`grid gap-2 sm:gap-3 ${
          mode === 'number' ? 'grid-cols-3' : 'grid-cols-4'
        }`}>
          {cards.map((card) => (
            <Card
              key={card.id}
              className={`
                aspect-square flex items-center justify-center text-lg sm:text-2xl font-bold cursor-pointer
                transition-all duration-300 game-card min-h-[60px] sm:min-h-[80px]
                ${card.isSelected 
                  ? card.state === 'correct' 
                    ? 'bg-success border-success text-success-foreground shadow-neon'
                    : 'bg-error border-error text-error-foreground'
                  : 'hover:scale-105 hover:shadow-neon-sm'
                }
                ${gameState !== 'playing' ? 'pointer-events-none' : ''}
                ${card.isTarget && showHint ? 'ring-2 ring-primary shadow-neon animate-pulse' : ''}
              `}
              onClick={() => handleCardClick(card)}
            >
              {card.content}
            </Card>
          ))}
        </div>
      </div>

      {/* Game Over Modal */}
      {(gameState === 'wrong' || gameState === 'gameover') && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-8 max-w-sm mx-4 text-center space-y-6 animate-scale-in border-error shadow-neon-lg">
            <div className="text-6xl mb-4">
              {gameState === 'gameover' ? '💀' : '❌'}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {gameState === 'gameover' ? 'Game Over!' : 'Wrong Answer!'}
              </h2>
              <p className="text-muted-foreground">
                {gameState === 'gameover' 
                  ? 'No lives remaining. Try again?' 
                  : `Lives remaining: ${stats.lives}`
                }
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleRetry}
                className={`flex-1 bg-gradient-to-r ${getModeColor()}`}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button 
                variant="outline" 
                onClick={onExit}
                className="flex-1"
              >
                Exit
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GameBoard;