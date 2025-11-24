/**
 * Core domain types for the StudyWithTest application
 */

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
  testType?: 'failed' | 'bookmarked' | 'specific'; // Type of special test
  questionIds?: string[]; // For specific question tests
}

export interface UserData {
  subjects: Subject[];
  tests: Test[];
  results: TestResult[];
  failedQuestionIds: string[];
  bookmarkedQuestionIds: string[];
}
