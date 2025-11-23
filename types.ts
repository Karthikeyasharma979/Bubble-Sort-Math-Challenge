export interface BubbleData {
  id: string;
  expression: string;
  value: number;
}

export enum GameStatus {
  INTRO = 'INTRO',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  CHECKING = 'CHECKING',
  RESULT = 'RESULT',
  GAME_OVER = 'GAME_OVER'
}

export interface TutorialStep {
  title?: string;
  description: string;
  showButton?: boolean;
}

export interface LevelResult {
  correct: boolean;
  timeTaken: number;
}