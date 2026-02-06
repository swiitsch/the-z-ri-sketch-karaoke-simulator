
export enum GameState {
  WELCOME = 'WELCOME',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  LOBBY = 'LOBBY',
  SEARCHING = 'SEARCHING',
  PLAYING = 'PLAYING',
  RESULTS = 'RESULTS'
}

export interface Character {
  id: string;
  name: string;
  description: string;
  color: string;
  image: string;
}

export interface SongLyric {
  word: string;
  startTime: number; // seconds
  duration: number;
}

export interface SongData {
  title: string;
  artist: string;
  lyrics: SongLyric[];
  bpm?: number;
}

export interface ScoreData {
  hits: number;
  misses: number;
  accuracy: number;
}
