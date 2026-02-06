
export enum GameState {
  WELCOME = 'WELCOME',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  RESULTS = 'RESULTS'
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface Character {
  id: string;
  name: string;
  description: string;
  color: string;
  image: string;
}

export interface WordInstance {
  text: string;
  id: number;
  x: number;
  y: number;
  active: boolean;
  clicked: boolean;
  missed: boolean;
}

export interface ScoreData {
  hits: number;
  misses: number;
  accuracy: number;
}

// Added LyricItem and SongData interfaces to support Gemini AI karaoke features
export interface LyricItem {
  word: string;
  startTime: number;
  duration: number;
}

export interface SongData {
  title: string;
  artist: string;
  lyrics: LyricItem[];
}
