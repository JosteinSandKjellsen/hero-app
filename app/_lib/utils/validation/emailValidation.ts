/**
 * Validates an email address with a comprehensive set of rules:
 * - Must contain exactly one @ symbol
 * - Local part (before @) must:
 *   - Be 1-64 characters long
 *   - Contain only letters, numbers, and certain special characters
 *   - Not start or end with a dot
 * - Domain part (after @) must:
 *   - Be 1-255 characters long
 *   - Contain only letters, numbers, dots, and hyphens
 *   - Not start or end with a dot or hyphen
 *   - Have a valid TLD (at least 2 characters)
 */
export const isValidEmail = (email: string): boolean => {
  // First, sanitize the input
  const sanitizedEmail = email.trim().toLowerCase();
  
  if (!sanitizedEmail || sanitizedEmail.length > 320) { // 64 + @ + 255
    return false;
  }

  // Split into local and domain parts
  const parts = sanitizedEmail.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [local, domain] = parts;

  // Validate lengths
  if (local.length === 0 || local.length > 64 || domain.length === 0 || domain.length > 255) {
    return false;
  }

  // Comprehensive email regex
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  
  return emailRegex.test(sanitizedEmail);
};
