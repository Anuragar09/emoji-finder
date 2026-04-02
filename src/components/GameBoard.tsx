import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameCard, GameState, GameMode, GameStats } from '@/types/game';
import { generateGameData, playSound, saveGameProgress } from '@/utils/gameUtils';
import { useToast } from '@/hooks/use-toast';
import { Heart, Clock, Target, Zap, Home, RotateCcw, Settings, Volume2, VolumeX, HelpCircle, Gift, Crown, Star, Trophy } from 'lucide-react';
import logoImage from '@/assets/emoji-quest-logo.png';
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
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
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

      // Show interstitial ad every 5 levels
      if (newLevel % 5 === 0) {
        setShowInterstitialAd(true);
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
    setHintsUsed(0); // Reset hints after watching ad
    
    setTimeout(() => {
      setShowHint(false);
    }, 3000);
  };

  const handleInterstitialAdClosed = () => {
    setShowInterstitialAd(false);
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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 pointer-events-none"></div>
      
      {/* Modern Header with Branding */}
      <div className="relative bg-card/80 backdrop-blur-lg border-b border-primary/20 px-3 py-2 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* Logo and Game Modes */}
          <div className="flex items-center space-x-3 flex-1">
            <img 
              src={logoImage} 
              alt="Emoji Quest" 
              className="w-8 h-8 rounded-lg animate-pulse cursor-pointer" 
              onClick={onHome}
            />
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
              {gameModes.map((gameMode) => (
                <Button
                  key={gameMode.id}
                  variant="ghost"
                  size="sm"
                  className={`relative flex flex-col items-center space-y-0.5 min-w-[60px] h-12 transition-all duration-300 px-2 ${
                    currentMode === gameMode.id 
                      ? 'bg-primary/20 text-primary shadow-neon scale-105 border border-primary/50' 
                      : 'hover:bg-muted/50 text-muted-foreground hover:scale-102'
                  }`}
                  onClick={() => handleModeChange(gameMode.id)}
                >
                  <span className="text-lg animate-bounce-gentle">{gameMode.icon}</span>
                  <span className="text-[10px] font-medium hidden sm:block">{gameMode.title}</span>
                  {currentMode === gameMode.id && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                  )}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Modern Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2 p-2 h-10 w-10 hover:bg-primary/20 hover:text-primary transition-all duration-300 hover:scale-105">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-card/95 backdrop-blur-lg border-primary/20">
              <DropdownMenuItem 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="hover:bg-primary/10 hover:text-primary transition-colors duration-200"
              >
                {soundEnabled ? <Volume2 className="mr-3 h-4 w-4" /> : <VolumeX className="mr-3 h-4 w-4" />}
                {soundEnabled ? 'Turn Off Sound' : 'Turn On Sound'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={showHowToPlay}
                className="hover:bg-secondary/10 hover:text-secondary transition-colors duration-200"
              >
                <HelpCircle className="mr-3 h-4 w-4" />
                How to Play
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowRewardAd(true)}
                className="hover:bg-accent/10 hover:text-accent transition-colors duration-200"
              >
                <Gift className="mr-3 h-4 w-4" />
                Watch Rewarded Ad
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onHome}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
              >
                <Home className="mr-3 h-4 w-4" />
                Exit Game
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Modern Main Content */}
      <div className="relative flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
        {/* Lives Refill Timer */}
        {livesRefillTimer !== null && livesRefillTimer > 0 && (
          <Card className="relative overflow-hidden p-4 bg-gradient-to-r from-error/20 via-destructive/20 to-neon-pink/20 border border-error/50 animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-r from-error/10 to-neon-pink/10 animate-glow-pulse"></div>
            <div className="relative text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Heart className="w-5 h-5 text-error animate-bounce" />
                <span className="text-lg font-bold text-error">Lives Refilling...</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Next life in: {Math.floor(livesRefillTimer / 60)}:{(livesRefillTimer % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </Card>
        )}

        {/* Modern Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="relative overflow-hidden p-3 text-center bg-gradient-to-br from-neon-blue/20 via-secondary/20 to-neon-blue/30 border border-secondary/50 transition-all duration-300 hover:scale-105 hover:shadow-neon">
            <div className="absolute inset-0 bg-gradient-secondary opacity-5 animate-glow-pulse"></div>
            <div className="relative">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-secondary animate-pulse" />
                <span className="text-lg sm:text-xl font-bold text-secondary">{stats.timeLeft}s</span>
              </div>
              <div className="text-xs text-muted-foreground font-medium">Time Left</div>
            </div>
          </Card>
          
          <Card className="relative overflow-hidden p-3 text-center bg-gradient-to-br from-error/20 via-destructive/20 to-neon-pink/30 border border-error/50 transition-all duration-300 hover:scale-105 hover:shadow-neon">
            <div className="absolute inset-0 bg-gradient-to-r from-error/5 to-neon-pink/5 animate-glow-pulse"></div>
            <div className="relative">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-error animate-bounce-gentle" />
                <span className="text-lg sm:text-xl font-bold text-error">{stats.lives}</span>
              </div>
              <div className="text-xs text-muted-foreground font-medium">Lives</div>
            </div>
          </Card>
          
          <Card className="relative overflow-hidden p-3 text-center bg-gradient-to-br from-success/20 via-neon-green/20 to-success/30 border border-success/50 transition-all duration-300 hover:scale-105 hover:shadow-neon">
            <div className="absolute inset-0 bg-gradient-to-r from-success/5 to-neon-green/5 animate-glow-pulse"></div>
            <div className="relative">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-success animate-bounce-gentle" />
                <span className="text-lg sm:text-xl font-bold text-success">L{stats.level}</span>
              </div>
              <div className="text-xs text-muted-foreground font-medium">Level</div>
            </div>
          </Card>
        </div>

        {/* Modern Target Display */}
        <div className="space-y-4">
          <Card className="relative overflow-hidden p-6 bg-gradient-primary/10 border border-primary/30 animate-fade-in">
            <div className="absolute inset-0 bg-gradient-primary opacity-5 animate-glow-pulse"></div>
            <div className="relative text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Target className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-sm text-muted-foreground font-medium">Find Your Target</span>
              </div>
              <div className={`relative inline-block text-5xl sm:text-6xl font-bold transition-all duration-500 ${
                showHint 
                  ? 'animate-glow-pulse scale-125 text-primary shadow-neon-lg' 
                  : 'text-foreground hover:scale-110'
              }`}>
                {target}
                {showHint && (
                  <div className="absolute inset-0 bg-primary/20 rounded-xl animate-pulse"></div>
                )}
              </div>
            </div>
          </Card>

          {/* Modern Action Buttons */}
          <div className="flex space-x-3 justify-center">
            {hintsUsed >= 3 ? (
              <RewardedAd 
                adUnitId="4203085766"
                onAdComplete={handleRewardAdComplete}
              >
                <span className="hidden sm:inline">Watch Ad for Hints</span>
                <span className="sm:hidden">Watch Ad</span>
              </RewardedAd>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleHint}
                className="group relative space-x-2 text-sm border-accent/50 text-accent hover:bg-accent/10 hover:scale-105 transition-all duration-300"
              >
                <Zap className="h-4 w-4 group-hover:animate-bounce" />
                <span className="hidden sm:inline">{3 - hintsUsed} Hints Left</span>
                <span className="sm:hidden">Hint</span>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={initializeGame}
              className="group space-x-2 text-sm border-secondary/50 text-secondary hover:bg-secondary/10 hover:scale-105 transition-all duration-300"
            >
              <RotateCcw className="h-4 w-4 group-hover:animate-spin" />
              <span className="hidden sm:inline">Reset Level</span>
              <span className="sm:hidden">Reset</span>
            </Button>
          </div>
        </div>

        {/* Modern Game Grid */}
        <div className="grid grid-cols-4 gap-3 max-w-sm sm:max-w-lg mx-auto mb-6">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={`
                relative aspect-square flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold cursor-pointer
                transition-all duration-500 ease-out min-h-[60px] sm:min-h-[75px] md:min-h-[85px] overflow-hidden group
                ${card.isSelected 
                  ? card.state === 'correct' 
                    ? 'bg-gradient-to-br from-success via-neon-green to-success/80 text-white scale-110 shadow-neon-lg animate-scale-in border-2 border-success' 
                    : 'bg-gradient-to-br from-error via-destructive to-error/80 text-white scale-95 shadow-neon animate-fade-out border-2 border-error'
                  : 'bg-gradient-to-br from-card via-card/90 to-muted/20 text-foreground hover:scale-105 border border-border hover:border-primary/70 hover:shadow-neon-sm hover:bg-gradient-to-br hover:from-primary/5 hover:to-secondary/5'
                }
              `}
              onClick={() => handleCardClick(card)}
            >
              <div className="relative z-10 transition-all duration-300 group-hover:animate-bounce-gentle">
                {card.content}
              </div>
              {!card.isSelected && (
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              )}
              {card.isSelected && card.state === 'correct' && (
                <div className="absolute inset-0 bg-gradient-to-br from-success/20 to-neon-green/20 animate-glow-pulse"></div>
              )}
            </Card>
          ))}
        </div>
      </div>


    </div>
  );
};

export default GameBoard;