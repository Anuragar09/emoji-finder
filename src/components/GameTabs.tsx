import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GameMode } from '@/types/game';
import { loadGameProgress } from '@/utils/gameUtils';

interface GameTabsProps {
  onGameSelect: (mode: GameMode, level: number) => void;
}

const GameTabs = ({ onGameSelect }: GameTabsProps) => {
  const [activeTab, setActiveTab] = useState<GameMode>('emoji');
  const [lastLevel, setLastLevel] = useState<number>(1);

  useEffect(() => {
    const progress = loadGameProgress?.(activeTab);
    setLastLevel(progress?.level ?? 1);
  }, [activeTab]);

  const tabs = [
    {
      id: 'emoji' as GameMode,
      title: 'Emoji Finder',
      icon: '😀',
      description: 'Find the target emoji among 16 cards',
      color: 'from-neon-pink to-neon-purple'
    },
    {
      id: 'number' as GameMode,
      title: 'Number Finder', 
      icon: '🔢',
      description: 'Find numbers from 0-9',
      color: 'from-neon-blue to-neon-green'
    },
    {
      id: 'alphabet' as GameMode,
      title: 'Alphabet Finder',
      icon: '🔤', 
      description: 'Find letters A-Z and a-z',
      color: 'from-neon-yellow to-neon-orange'
    },
    {
      id: 'shape' as GameMode,
      title: 'Shape Finder',
      icon: '🔶',
      description: 'Find geometric shapes',
      color: 'from-neon-green to-neon-blue'
    }
  ];

  return (
      <div className="min-h-screen bg-background p-4 flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Emoji Finder
          </h1>
          <p className="text-muted-foreground">
            Choose a mode and level to start playing
          </p>
        </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-4xl mx-auto">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 transition-all duration-300 tab-indicator ${
              activeTab === tab.id ? 'active shadow-neon' : ''
            }`}
          >
            <span className="mr-2 text-xl">{tab.icon}</span>
            {tab.title}
          </Button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="max-w-2xl mx-auto">
        {tabs.map((tab) => (
          <Card
            key={tab.id}
            className={`p-8 game-card transition-all duration-500 ${
              activeTab === tab.id 
                ? 'opacity-100 translate-y-0 animate-scale-in' 
                : 'opacity-0 translate-y-4 absolute pointer-events-none'
            }`}
          >
            <div className="text-center space-y-6">
              {/* Game Icon */}
              <div className={`text-8xl mb-4 p-6 rounded-full bg-gradient-to-r ${tab.color} w-32 h-32 flex items-center justify-center mx-auto shadow-neon-lg`}>
                {tab.icon}
              </div>

              {/* Game Info */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {tab.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-2">
                  {tab.description}
                </p>
                <p className="text-sm text-muted-foreground">Last unlocked level: <span className="font-semibold text-primary">{lastLevel}</span></p>
              </div>

              {/* Level Selection */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">
                  Select Level (1-100)
                </h3>
                <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-card/50 p-4">
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((level) => (
                      <Button
                        key={level}
                        onClick={() => onGameSelect(activeTab, level)}
                        variant="outline"
                        className={`aspect-square text-sm font-semibold bg-gradient-to-r ${tab.color} border-2 border-transparent hover:border-primary neon-glow transition-all duration-300 opacity-80 hover:opacity-100`}
                        size="sm"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Game Stats Preview */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">⏱️</div>
                  <div className="text-sm text-muted-foreground">30 seconds</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">❤️</div>
                  <div className="text-sm text-muted-foreground">3 lives</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">🎯</div>
                  <div className="text-sm text-muted-foreground">Find target</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Card className="p-4 text-center bg-card/80 border-dashed border-primary">
          <span className="text-muted-foreground">Test Ad Banner</span>
        </Card>
      </div>
    </div>
  );
};

export default GameTabs;