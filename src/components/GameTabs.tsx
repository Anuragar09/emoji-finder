import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameMode } from '@/types/game';
import { Play, Crown, Star, Zap } from 'lucide-react';
import logoImage from '@/assets/emoji-quest-logo.png';

interface GameTabsProps {
  onGameSelect: (mode: GameMode, level: number) => void;
}

const GameTabs = ({ onGameSelect }: GameTabsProps) => {
  const [activeTab, setActiveTab] = useState<GameMode>('emoji');
  const [lastLevel, setLastLevel] = useState<number>(1);

  useEffect(() => {
    const savedData = localStorage.getItem(`neon-finder-${activeTab}`);
    if (savedData) {
      const { level } = JSON.parse(savedData);
      setLastLevel(level || 1);
    } else {
      setLastLevel(1);
    }
  }, [activeTab]);

  const tabs = [
    {
      id: 'emoji' as GameMode,
      title: 'Emoji',
      icon: '😀',
      description: 'Find the target emoji among various cute characters',
      color: 'from-neon-pink to-neon-purple'
    },
    {
      id: 'number' as GameMode,
      title: 'Number', 
      icon: '🔢',
      description: 'Find numbers from 10-99 in the grid',
      color: 'from-neon-blue to-neon-green'
    },
    {
      id: 'alphabet' as GameMode,
      title: 'Alphabet',
      icon: '🔤', 
      description: 'Find uppercase and lowercase letters',
      color: 'from-neon-yellow to-neon-orange'
    },
    {
      id: 'shape' as GameMode,
      title: 'Shape',
      icon: '🔶',
      description: 'Find geometric shapes and symbols',
      color: 'from-neon-green to-neon-blue'
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab)!;

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header with Logo */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
        <div className="relative text-center py-8 px-4 space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <img 
              src={logoImage} 
              alt="Emoji Quest Logo" 
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl animate-bounce-gentle"
            />
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-glow-pulse">
                EMOJI QUEST
              </h1>
              <div className="flex items-center justify-center space-x-1 mt-1">
                <Star className="w-4 h-4 text-neon-yellow animate-pulse" />
                <span className="text-xs text-muted-foreground">Ultimate Challenge</span>
                <Star className="w-4 h-4 text-neon-yellow animate-pulse" />
              </div>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Master the ultimate emoji finding challenge across multiple game modes
          </p>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="px-4 py-3 bg-card/50 backdrop-blur-sm border-b border-border">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide max-w-md mx-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className={`relative flex flex-col items-center space-y-1 min-w-[80px] h-16 transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-primary/20 text-primary shadow-neon scale-105 border border-primary/50' 
                  : 'hover:bg-muted/50 text-muted-foreground hover:scale-102'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-2xl animate-bounce-gentle">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.title}</span>
              {activeTab === tab.id && (
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Modern Main Content */}
      <div className="flex-1 px-4 py-6 space-y-6">
        <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-card via-card/90 to-primary/5 border border-primary/20 animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative text-center space-y-6">
            <div className={`relative w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${activeTabData.color} flex items-center justify-center text-4xl text-white shadow-neon animate-glow-pulse`}>
              {activeTabData.icon}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-neon-yellow rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-background" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {activeTabData.title} Mode
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                {activeTabData.description}
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Badge variant="outline" className="border-primary/50 text-primary">
                  <Zap className="w-3 h-3 mr-1" />
                  Level {lastLevel} Unlocked
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Modern Level Selection */}
        <Card className="relative overflow-hidden p-6 bg-card/70 backdrop-blur-sm border border-primary/20">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-foreground flex items-center justify-center space-x-2">
                <Play className="w-5 h-5 text-primary" />
                <span>Choose Your Challenge</span>
              </h3>
              <p className="text-xs text-muted-foreground">Select any unlocked level to start playing</p>
            </div>
            
            <div className="grid grid-cols-5 gap-3 max-h-72 overflow-y-auto p-2">
              {Array.from({ length: 100 }, (_, i) => i + 1).map((level) => (
                <Button
                  key={level}
                  variant="ghost"
                  size="sm"
                  disabled={level > lastLevel}
                  className={`relative aspect-square text-sm font-bold transition-all duration-300 group ${
                    level <= lastLevel 
                      ? 'bg-gradient-to-br from-primary/20 to-secondary/20 text-primary border border-primary/50 hover:scale-110 hover:shadow-neon hover:bg-gradient-to-br hover:from-primary/30 hover:to-secondary/30' 
                      : 'opacity-40 cursor-not-allowed bg-muted/20 text-muted-foreground border border-muted/30'
                  }`}
                  onClick={() => onGameSelect(activeTab, level)}
                >
                  {level}
                  {level <= lastLevel && (
                    <div className="absolute inset-0 rounded-md bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Game Stats Preview */}
        <Card className="p-4 bg-gradient-to-r from-muted/20 to-primary/10 border border-muted/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl">⏱️</div>
              <div className="text-xs text-muted-foreground font-medium">30 seconds</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">❤️</div>
              <div className="text-xs text-muted-foreground font-medium">3 lives</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🎯</div>
              <div className="text-xs text-muted-foreground font-medium">Find target</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modern Ad Banner */}
      <div className="sticky bottom-0 inset-x-0 p-3 bg-card/95 backdrop-blur-lg border-t border-primary/20 text-center">
        <div className="text-xs text-muted-foreground bg-gradient-to-r from-muted/30 via-primary/10 to-muted/30 rounded-lg px-3 py-2 max-w-xs mx-auto">
          🎮 Test Ad Banner - EMOJI QUEST
        </div>
      </div>
    </div>
  );
};

export default GameTabs;