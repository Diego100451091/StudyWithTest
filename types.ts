export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
  explanation: string;
}

export interface Test {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  createdAt: number;
  questions: Question[];
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  color: string;
}

export enum TestMode {
  READING = 'READING', // Shows answers immediately
  STUDY = 'STUDY',     // Shows answer after selection
  EXAM = 'EXAM'        // Shows answers at end
}

export interface QuestionResult {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

export interface TestResult {
  id: string;
  testIds: string[]; // Can be multiple if combined
  subjectId: string;
  date: number;
  score: number;
  totalQuestions: number;
  mode: TestMode;
  timeTaken: number; // Total seconds
  answers: QuestionResult[];
}

export interface UserData {
  subjects: Subject[];
  tests: Test[];
  results: TestResult[];
  failedQuestionIds: string[]; // Set of IDs
  bookmarkedQuestionIds: string[]; // Set of IDs
}

export const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#84cc16', // Lime
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#f43f5e', // Rose
  '#64748b', // Slate
];