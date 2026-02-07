export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Verse {
  id: number;
  surah: number;
  number: number;
  arabic: string;
  transliteration: string;
  translation: string;
}

export interface TafsirInsight {
  scholar: string;
  insight: string;
}

export interface WordAnalysis {
  arabicWord: string;
  root: string;
  meaning: string;
  nuance: string;
}

export type ConnectionType = 'quran' | 'hadith' | 'history' | 'geography' | 'general';

export interface Connection {
  type: ConnectionType;
  source: string; // e.g., "Quran 2:152" or "Sahih Bukhari 50"
  text: string;
  explanation: string;
  url?: string; // External link to source
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface VerseAnalysis {
  simpleMeaning: string;
  topics: string[];
  tafsirInsights: TafsirInsight[];
  wordAnalysis: WordAnalysis[];
  historicalContext: string;
  moralTeachings: string[];
  connections: Connection[];
  reflectionQuestion: string;
  quizQuestions: QuizQuestion[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
