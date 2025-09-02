import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameCard, GameState, GameMode, GameStats } from '@/types/game';
import { generateGameData, playSound, saveGameProgress } from '@/utils/gameUtils';
import { useToast } from '@/hooks/use-toast';
import { Heart, Clock, Target, Zap, Home, RotateCcw, Settings, Volume2, VolumeX, HelpCircle, Gift } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GameBoardProps {
  mode: GameMode;
  initialLevel: number;
  onExit: () => void;
  onHome: () => void;
}

const gameModes = [
  { id: 'emoji' as GameMode, icon: '😀', title: 'Emoji' },
  { id: 'number' as GameMode, icon: '🔢', title: 'Number' },
  { id: 'alphabet' as GameMode, icon: '🔤', title: 'Alphabet' },
  { id: 'shape' as GameMode, icon: '🔶', title: 'Shape' },
];

const GameBoard: React.FC<GameBoardProps> = ({ mode, initialLevel, onExit, onHome }) => {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [target, setTarget] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showRewardAd, setShowRewardAd] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stats, setStats] = useState<GameStats>({
    level: initialLevel,
    lives: 3,
    timeLeft: 30,
    score: 0,
    mode: mode,
  });
  const [livesRefillTimer, setLivesRefillTimer] = useState<number | null>(null);
  const [correctLevels, setCorrectLevels] = useState(0);
  const { toast } = useToast();

  // Initialize game
  const initializeGame = useCallback(() => {
    const gameData = generateGameData(currentMode, stats.level);
    setCards(gameData.cards);
    setTarget(gameData.target);
    setStats(prev => ({ ...prev, timeLeft: 30 }));
    setGameState('playing');
  }, [currentMode, stats.level]);

  // Initialize on mount and when mode/level changes
  useEffect(() => {
    if (mode !== currentMode) {
      setCurrentMode(mode);
      setStats(prev => ({ ...prev, mode, level: initialLevel }));
    }
  }, [mode, initialLevel, currentMode]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

   // Timer effect
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setStats(prev => {
        if (prev.timeLeft <= 1) {
          setGameState('timeout');
          handleTimeout();
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Lives refill timer effect
  useEffect(() => {
    if (livesRefillTimer !== null && livesRefillTimer > 0) {
      const timer = setInterval(() => {
        setLivesRefillTimer(prev => {
          if (prev !== null && prev <= 1) {
            setStats(prevStats => ({ ...prevStats, lives: 3 }));
            toast({
              title: "Lives Refilled! ❤️",
              description: "Your lives have been restored!",
              duration: 2000,
            });
            return null;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [livesRefillTimer, toast]);

  const handleTimeout = () => {
    if (soundEnabled) playSound('wrong');
    
    const newLives = stats.lives - 1;
    setStats(prev => ({ ...prev, lives: newLives }));
    
    if (newLives <= 0) {
      setGameState('gameover');
      setLivesRefillTimer(120);
      
      setTimeout(() => {
        onHome();
      }, 3000);
    } else {
      setTimeout(() => {
        initializeGame();
      }, 1500);
    }
  };

  const handleCardClick = (card: GameCard) => {
    if (gameState !== 'playing' || card.isSelected) return;
    
    if (soundEnabled) playSound('tap');
    
    const updatedCards = cards.map(c => 
      c.id === card.id 
        ? { ...c, isSelected: true, state: (card.isTarget ? 'correct' : 'wrong') as 'correct' | 'wrong' }
        : c
    );
    setCards(updatedCards);

    if (card.isTarget) {
      setGameState('correct');
      if (soundEnabled) playSound('correct');
      
      // Award points and advance level
      const points = Math.max(10, stats.timeLeft * 2);
      const newScore = stats.score + points;
      const newLevel = stats.level + 1;
      const newCorrectLevels = correctLevels + 1;
      
      setStats(prev => ({ ...prev, score: newScore, level: newLevel }));
      setCorrectLevels(newCorrectLevels);
      
      // Refill lives after 3 correct levels
      if (newCorrectLevels % 3 === 0) {
        setStats(prev => ({ ...prev, lives: 3 }));
        setLivesRefillTimer(null);
        toast({
          title: "Lives Refilled! 💖",
          description: "You completed 3 levels correctly!",
          duration: 2000,
        });
      }
      
      saveGameProgress(newLevel, mode, newScore);
      
      setTimeout(() => {
        initializeGame();
      }, 1500);
    } else {
      setGameState('wrong');
      if (soundEnabled) playSound('wrong');
      
      const newLives = stats.lives - 1;
      setStats(prev => ({ ...prev, lives: newLives }));
      
      if (newLives <= 0) {
        setGameState('gameover');
        // Start 2-minute refill timer
        setLivesRefillTimer(120);
        
        setTimeout(() => {
          onHome();
        }, 3000);
      } else {
        setTimeout(() => {
          initializeGame();
        }, 1500);
      }
    }
  };

  const handleHint = () => {
    if (hintsUsed >= 3) {
      setShowRewardAd(true);
      return;
    }
    
    setShowHint(true);
    setHintsUsed(prev => prev + 1);
    
    setTimeout(() => {
      setShowHint(false);
    }, 3000);
  };

  const handleRewardAdComplete = () => {
    setShowRewardAd(false);
    setShowHint(true);
    
    setTimeout(() => {
      setShowHint(false);
    }, 3000);
  };

  const handleModeChange = (newMode: GameMode) => {
    if (newMode !== currentMode) {
      setCurrentMode(newMode);
      setStats(prev => ({ ...prev, mode: newMode, level: 1 }));
    }
  };

  const showHowToPlay = () => {
    toast({
      title: "How to Play",
      description: "Find and tap the target item shown at the top. You have 30 seconds and 3 lives. Complete 3 levels to refill lives!",
      duration: 5000,
    });
  };

  const showTestAd = () => {
    toast({
      title: "Test Ad",
      description: "This would show a test advertisement.",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Game Modes and Settings */}
      <div className="bg-card border-b border-border px-3 py-2 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* Game Mode Tabs */}
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide flex-1">
            {gameModes.map((gameMode) => (
              <Button
                key={gameMode.id}
                variant={currentMode === gameMode.id ? "default" : "ghost"}
                size="sm"
                className={`flex items-center space-x-1.5 min-w-max transition-all duration-300 px-2 py-1.5 h-8 ${
                  currentMode === gameMode.id 
                    ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                    : 'hover:bg-muted hover:scale-102 text-muted-foreground'
                }`}
                onClick={() => handleModeChange(gameMode.id)}
              >
                <span className="text-sm">{gameMode.icon}</span>
                <span className="text-xs font-medium hidden sm:inline">{gameMode.title}</span>
              </Button>
            ))}
          </div>
          
          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2 p-1.5 h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
                {soundEnabled ? 'Turn Off Sound' : 'Turn On Sound'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={showHowToPlay}>
                <HelpCircle className="mr-2 h-4 w-4" />
                How to Play
              </DropdownMenuItem>
              <DropdownMenuItem onClick={showTestAd}>
                <Gift className="mr-2 h-4 w-4" />
                Show Test Ad
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onHome}>
                <Home className="mr-2 h-4 w-4" />
                Exit Game
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 space-y-4 pb-0 overflow-y-auto">
        {/* Lives Refill Timer */}
        {livesRefillTimer !== null && livesRefillTimer > 0 && (
          <Card className="p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-300 animate-fade-in">
            <div className="text-center">
              <div className="text-base font-bold text-red-600 mb-1">Lives Refilling...</div>
              <div className="text-sm text-muted-foreground">
                Next life in: {Math.floor(livesRefillTimer / 60)}:{(livesRefillTimer % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </Card>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Card className="p-2 sm:p-3 text-center bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              <span className="text-base sm:text-lg font-bold text-blue-600">{stats.timeLeft}s</span>
            </div>
            <div className="text-xs text-muted-foreground">Time</div>
          </Card>
          
          <Card className="p-2 sm:p-3 text-center bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-1">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
              <span className="text-base sm:text-lg font-bold text-red-600">{stats.lives}</span>
            </div>
            <div className="text-xs text-muted-foreground">Lives</div>
          </Card>
          
          <Card className="p-2 sm:p-3 text-center bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-1">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <span className="text-base sm:text-lg font-bold text-green-600">L{stats.level}</span>
            </div>
            <div className="text-xs text-muted-foreground">Level</div>
          </Card>
        </div>

        {/* Target Display */}
        <div className="space-y-3">
          <Card className="p-3 sm:p-4 bg-gradient-to-r from-primary/20 to-secondary/20 border-primary animate-fade-in">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-muted-foreground mb-2">Find this target:</div>
              <div className={`text-3xl sm:text-4xl font-bold transition-all duration-300 ${showHint ? 'animate-pulse scale-110 text-primary shadow-neon' : 'text-foreground'}`}>{target}</div>
            </div>
          </Card>

          {/* Hint and Reset Buttons */}
          <div className="flex space-x-2 justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleHint}
              className="space-x-1.5 text-xs hover-scale"
            >
              <Zap className="h-3 w-3" />
              <span className="hidden sm:inline">Hint {hintsUsed >= 3 ? '(Watch Ad)' : `(${3 - hintsUsed} left)`}</span>
              <span className="sm:hidden">Hint</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={initializeGame}
              className="space-x-1.5 text-xs hover-scale"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm sm:max-w-md mx-auto mb-4">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={`
                aspect-square flex items-center justify-center text-base sm:text-lg md:text-xl font-bold text-foreground cursor-pointer
                transition-all duration-300 game-card min-h-[50px] sm:min-h-[60px] md:min-h-[70px]
                ${card.isSelected 
                  ? card.state === 'correct' 
                    ? 'bg-green-500 text-white scale-110 shadow-lg shadow-green-500/50 animate-scale-in' 
                    : 'bg-red-500 text-white scale-95 shadow-lg shadow-red-500/50 animate-fade-out'
                  : 'bg-card hover:bg-muted hover:scale-105 border border-border hover:border-primary/50 hover-scale'
                }
              `}
              onClick={() => handleCardClick(card)}
            >
              {card.content}
            </Card>
          ))}
        </div>
      </div>

      {/* Sticky Ad Banner */}
      <div className="bg-card border-t border-border p-2 text-center">
        <div className="text-xs text-muted-foreground bg-muted/20 rounded px-2 py-1">
          Test Ad Banner
        </div>
      </div>

      {/* Reward Ad Modal */}
      {showRewardAd && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-6 max-w-sm mx-4 text-center space-y-4 animate-scale-in">
            <div className="text-4xl">🎁</div>
            <div>
              <h3 className="text-lg font-bold mb-2">Watch Ad for Hints</h3>
              <p className="text-sm text-muted-foreground">Watch a reward ad to get more hints</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRewardAdComplete} className="flex-1" size="sm">
                Watch Ad
              </Button>
              <Button variant="outline" onClick={() => setShowRewardAd(false)} className="flex-1" size="sm">
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