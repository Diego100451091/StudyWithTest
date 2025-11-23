/**
 * Utility functions for building URL query parameters
 */

/**
 * Builds a query string for test runner navigation
 * @param baseParams - Base query parameters
 * @param shuffleQuestions - Whether to shuffle questions
 * @param shuffleAnswers - Whether to shuffle answers
 * @returns Complete query string
 */
export function buildTestRunQuery(
  baseParams: string,
  shuffleQuestions: boolean,
  shuffleAnswers: boolean
): string {
  const params = new URLSearchParams(baseParams);
  
  if (shuffleQuestions) {
    params.set('shuffleQ', '1');
  }
  
  if (shuffleAnswers) {
    params.set('shuffleA', '1');
  }
  
  return params.toString();
}

/**
 * Parses query parameters from URL
 * @param searchParams - URLSearchParams object
 * @returns Parsed test configuration
 */
export function parseTestQuery(searchParams: URLSearchParams): {
  testIds: string[];
  type?: 'failed' | 'bookmarked' | 'specific';
  mode: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  specificQuestionIds?: string[];
} {
  return {
    testIds: searchParams.get('tests')?.split(',').filter(Boolean) || [],
    type: searchParams.get('type') as any,
    mode: searchParams.get('mode') || 'STUDY',
    shuffleQuestions: searchParams.get('shuffleQ') === '1',
    shuffleAnswers: searchParams.get('shuffleA') === '1',
    specificQuestionIds: searchParams.get('qids')?.split(',').filter(Boolean),
  };
}
