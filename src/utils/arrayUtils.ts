/**
 * Utility functions for array manipulation
 */

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Groups array items by a key selector
 * @param array - Array to group
 * @param keySelector - Function to extract the grouping key
 * @returns Record of grouped items
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keySelector: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keySelector(item);
    return {
      ...groups,
      [key]: [...(groups[key] || []), item],
    };
  }, {} as Record<K, T[]>);
}
