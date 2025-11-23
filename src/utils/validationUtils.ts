/**
 * Validation utilities for user input and data
 */

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Object with validation result and message
 */
export function validatePassword(password: string): {
  isValid: boolean;
  message: string;
} {
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long',
    };
  }
  
  return {
    isValid: true,
    message: '',
  };
}

/**
 * Validates that a string is not empty or only whitespace
 * @param value - String to validate
 * @returns True if string has content
 */
export function hasContent(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Sanitizes user input by trimming and removing extra whitespace
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}
