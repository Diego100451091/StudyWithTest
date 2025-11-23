/**
 * Date and time formatting utilities
 */

/**
 * Formats seconds into MM:SS format
 * @param seconds - Total seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

/**
 * Formats seconds into a human-readable duration (e.g., "2m 30s")
 * @param seconds - Total seconds
 * @returns Human-readable duration string
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Formats a timestamp into a localized date string
 * @param timestamp - Unix timestamp in milliseconds
 * @param locale - Locale string (default: 'es-ES')
 * @returns Formatted date string
 */
export function formatDate(timestamp: number, locale: string = 'es-ES'): string {
  return new Date(timestamp).toLocaleDateString(locale);
}

/**
 * Formats a timestamp into a localized date and time string
 * @param timestamp - Unix timestamp in milliseconds
 * @param locale - Locale string (default: 'es-ES')
 * @returns Formatted date and time string
 */
export function formatDateTime(timestamp: number, locale: string = 'es-ES'): string {
  return new Date(timestamp).toLocaleString(locale);
}
