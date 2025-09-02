import { GameCard, GameMode } from '@/types/game';

export const generateGameData = (mode: GameMode, level: number) => {
  let allItems: string[] = [];
  let cardCount = 16;

  switch (mode) {
    case 'emoji':
      allItems = [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
        '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
        '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
        '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
        '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮'
      ];
      break;
    case 'number':
      // Generate numbers from 10-99 for better variety
      allItems = [];
      for (let i = 10; i <= 99; i++) {
        allItems.push(i.toString());
      }
      cardCount = 16;
      break;
    case 'alphabet':
      allItems = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
      ];
      break;
    case 'shape':
      allItems = [
        '⚫', '⚪', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '🔺',
        '🔻', '🔸', '🔹', '🔶', '🔷', '⭐', '🌟', '💫', '✨', '🔥',
        '💧', '⭕', '❌', '➕', '➖', '✖️', '➗', '🟥', '🟧', '🟨',
        '🟩', '🟦', '🟪', '🟫', '⬛', '⬜', '◾', '◽', '▪️', '▫️'
      ];
      break;
  }

  // Select target
  const target = allItems[Math.floor(Math.random() * allItems.length)];

  // Generate cards
  const cards: GameCard[] = [];
  const usedItems = new Set<string>();

  // Add target card
  cards.push({
    id: 'target',
    content: target,
    isTarget: true
  });
  usedItems.add(target);

  // Add random cards
  while (cards.length < cardCount) {
    const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
    if (!usedItems.has(randomItem)) {
      cards.push({
        id: `card-${cards.length}`,
        content: randomItem,
        isTarget: false
      });
      usedItems.add(randomItem);
    }
  }

  // Shuffle cards
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return { cards, target };
};

export const playSound = (type: 'tap' | 'correct' | 'wrong') => {
  // Create audio context for sound effects
  if (typeof window !== 'undefined' && 'AudioContext' in window) {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    switch (type) {
      case 'tap':
        playTone(800, 0.1, 'square');
        break;
      case 'correct':
        playTone(880, 0.2);
        setTimeout(() => playTone(1047, 0.2), 100);
        setTimeout(() => playTone(1319, 0.3), 200);
        break;
      case 'wrong':
        playTone(200, 0.5, 'sawtooth');
        break;
    }
  }
};

export const saveGameProgress = (level: number, mode: GameMode, score: number) => {
  const key = `neon-finder-${mode}`;
  const existing = localStorage.getItem(key);
  const data = existing ? JSON.parse(existing) : { level: 1, score: 0 };
  
  if (level > data.level || score > data.score) {
    localStorage.setItem(key, JSON.stringify({ level, score, timestamp: Date.now() }));
  }
};

export const loadGameProgress = (mode: GameMode) => {
  const key = `neon-finder-${mode}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : { level: 1, score: 0 };
};