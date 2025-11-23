import { UserData, TestResult, Question, Test } from '../types';

/**
 * Calculate statistics for a subject
 */
export function calculateSubjectStats(
  subjectId: string,
  results: TestResult[]
): {
  totalAttempts: number;
  averageScore: number;
} {
  const subjectResults = results.filter(r => r.subjectId === subjectId);
  const totalAttempts = subjectResults.length;
  
  if (totalAttempts === 0) {
    return { totalAttempts: 0, averageScore: 0 };
  }
  
  const averageScore = Math.round(
    subjectResults.reduce((acc, curr) => {
      return acc + (curr.score / curr.totalQuestions * 100);
    }, 0) / totalAttempts
  );
  
  return { totalAttempts, averageScore };
}

/**
 * Get failed questions for a specific subject
 */
export function getFailedQuestionsForSubject(
  subjectId: string,
  tests: Test[],
  failedQuestionIds: string[]
): string[] {
  const subjectTests = tests.filter(t => t.subjectId === subjectId);
  const subjectQuestionIds = new Set(
    subjectTests.flatMap(t => t.questions.map(q => q.id))
  );
  
  return failedQuestionIds.filter(fid => subjectQuestionIds.has(fid));
}

/**
 * Get bookmarked questions for a specific subject
 */
export function getBookmarkedQuestionsForSubject(
  subjectId: string,
  tests: Test[],
  bookmarkedQuestionIds: string[]
): string[] {
  const subjectTests = tests.filter(t => t.subjectId === subjectId);
  const subjectQuestionIds = new Set(
    subjectTests.flatMap(t => t.questions.map(q => q.id))
  );
  
  return bookmarkedQuestionIds.filter(bid => subjectQuestionIds.has(bid));
}

/**
 * Calculate test result percentage
 */
export function calculateTestPercentage(result: TestResult): number {
  return Math.round((result.score / result.totalQuestions) * 100);
}

/**
 * Get questions by type (failed, bookmarked, or specific IDs)
 */
export function getQuestionsByType(
  subjectId: string,
  tests: Test[],
  type: 'failed' | 'bookmarked' | 'specific',
  data: UserData,
  specificIds?: string[]
): Question[] {
  const subjectTests = tests.filter(t => t.subjectId === subjectId);
  const allQuestions = subjectTests.flatMap(t => t.questions);
  
  switch (type) {
    case 'failed':
      return allQuestions.filter(q => data.failedQuestionIds.includes(q.id));
    case 'bookmarked':
      return allQuestions.filter(q => data.bookmarkedQuestionIds.includes(q.id));
    case 'specific':
      return allQuestions.filter(q => specificIds?.includes(q.id));
    default:
      return [];
  }
}
