import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { GameCard, GameMode, GameState, GameStats } from '@/types/game';
import { generateGameData, playSound, saveGameProgress } from '@/utils/gameUtils';
import { ArrowLeft, Heart, Timer, RotateCcw, Home, Lightbulb, Gift } from 'lucide-react';
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
  const [hintsUsed, setHintsUsed] = useState(0);
  const [correctLevelsCount, setCorrectLevelsCount] = useState(0);
  const [livesRefillTime, setLivesRefillTime] = useState<number | null>(null);
  const [showRewardAd, setShowRewardAd] = useState(false);

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

  // Lives refill timer effect
  useEffect(() => {
    if (livesRefillTime && stats.lives < 3) {
      const timer = setInterval(() => {
        setLivesRefillTime(prev => {
          if (prev && prev <= 1) {
            setStats(prevStats => ({ ...prevStats, lives: 3 }));
            toast({
              title: "Lives Refilled! ❤️",
              description: "Your lives have been restored!",
              duration: 2000,
            });
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [livesRefillTime, stats.lives, toast]);

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

    // Track correct levels for lives refill
    const newCorrectCount = correctLevelsCount + 1;
    setCorrectLevelsCount(newCorrectCount);

    // Refill lives after 3 correct levels
    if (newCorrectCount % 3 === 0 && stats.lives < 3) {
      setStats(prev => ({ ...prev, lives: 3 }));
      toast({
        title: "Lives Bonus! ❤️❤️❤️",
        description: "3 levels completed! Lives refilled!",
        duration: 2000,
      });
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
        // Start 2-minute lives refill timer
        setLivesRefillTime(120);
        toast({
          title: "Game Over! 💀",
          description: "Lives will refill in 2 minutes",
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
    if (hintsUsed < 3) {
      setShowHint(true);
      setHintsUsed(prev => prev + 1);
      setTimeout(() => setShowHint(false), 2000);
    } else {
      setShowRewardAd(true);
    }
  };

  const handleRewardAd = () => {
    setShowRewardAd(false);
    setHintsUsed(0); // Reset hints after watching ad
    setShowHint(true);
    setTimeout(() => setShowHint(false), 2000);
    toast({
      title: "Hints Refilled! 💡",
      description: "You can use 3 more hints!",
      duration: 2000,
    });
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compact Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onExit}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium">Lv.{stats.level}</span>
          <span className="text-muted-foreground">Score: {stats.score}</span>
          {livesRefillTime && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
              Lives in {Math.floor(livesRefillTime / 60)}:{(livesRefillTime % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onHome}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Home
        </Button>
      </div>

      {/* Mode Switcher - More Prominent */}
      <div className="bg-card/50 border-b border-border p-3">
        <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
          {(['emoji','number','alphabet','shape'] as GameMode[]).map((m) => (
            <Button
              key={m}
              variant={m === mode ? 'default' : 'ghost'}
              size="sm"
              className={`flex-1 transition-all duration-300 hover:scale-105 ${
                m === mode 
                  ? `bg-gradient-to-r ${getModeColor().replace('from-neon-', 'from-').replace('to-neon-', 'to-')} text-white shadow-lg` 
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => navigate(`/game/${m}/${stats.level}`)}
            >
              <span className="text-lg mr-1">{m === 'emoji' ? '😀' : m === 'number' ? '🔢' : m === 'alphabet' ? '🔤' : '🔶'}</span>
              <span className="capitalize text-xs">{m}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Game Content - Flex Grow */}
      <div className="flex-1 flex flex-col p-3 pb-0">
        {/* Game Stats */}
        <div className="max-w-md mx-auto mb-4 space-y-3">
          {/* Lives */}
          <div className="flex items-center justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i}
                className={`w-6 h-6 transition-all duration-300 ${
                  i < stats.lives 
                    ? 'text-red-500 fill-red-500 animate-pulse' 
                    : 'text-muted-foreground/50'
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
              disabled={hintsUsed >= 3 && !showRewardAd}
              className="bg-gradient-to-r from-accent/20 to-accent/30 hover:from-accent/30 hover:to-accent/40"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {hintsUsed >= 3 ? 'Watch Ad for Hint' : `Hint (${3 - hintsUsed} left)`}
            </Button>
          </div>
        </div>

        {/* Game Grid - Flex Grow */}
        <div className="flex-1 flex items-center justify-center">
          <div className={`grid gap-2 sm:gap-3 w-full max-w-md ${
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
                      : 'bg-destructive border-destructive text-destructive-foreground animate-pulse'
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
      </div>

      {/* Sticky Ad Banner - No Extra Space */}
      <div className="bg-card border-t border-border p-3 text-center">
        <div className="text-xs text-muted-foreground bg-muted/30 rounded py-2">
          Test Ad Banner - Sponsored Content
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

      {/* Reward Ad Modal */}
      {showRewardAd && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-8 max-w-sm mx-4 text-center space-y-6 animate-scale-in border-primary shadow-neon-lg">
            <div className="text-6xl mb-4">🎁</div>
            
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Watch Ad for Hints!</h2>
              <p className="text-muted-foreground">
                Watch a short ad to get 3 more hints
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleRewardAd}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white"
              >
                <Gift className="w-4 h-4 mr-2" />
                Watch Ad
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowRewardAd(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GameBoard;