export type GameMode = 'emoji' | 'number' | 'alphabet' | 'shape';

export type GameState = 'playing' | 'correct' | 'wrong' | 'timeout' | 'gameover';

export interface GameCard {
  id: string;
  content: string;
  isTarget: boolean;
  isSelected?: boolean;
  state?: 'default' | 'correct' | 'wrong';
}

export interface GameSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface GameStats {
  level: number;
  lives: number;
  timeLeft: number;
  score: number;
  mode: GameMode;
}

export interface LevelConfig {
  mode: GameMode;
  level: number;
  timeLimit: number;
  cardCount: number;
  targetCount: number;
}