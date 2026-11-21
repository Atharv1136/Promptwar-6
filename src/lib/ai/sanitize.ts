// ============================================================
// src/lib/ai/sanitize.ts
// Sanitization of untrusted user input, prompt injection defense, and delimiter neutralization
// Per SECURITY.md §4 and TESTING.md §4.3
// ============================================================

/**
 * Sanitizes untrusted user strings:
 * - Strips ASCII control characters (except newline and tab)
 * - Collapses consecutive whitespace
 * - Strips XML/delimiter forging tags (<UNTRUSTED_USER_TEXT>, </UNTRUSTED_USER_TEXT>)
 * - Preserves Devanagari and international characters
 * - Truncates to maxChars
 */
export function sanitizeUntrustedText(text: string, maxChars = 280): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // 1. Strip control characters (ASCII 0-8, 11-12, 14-31, 127) programmatically
  // eslint-disable-next-line no-control-regex
  let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Neutralize injection delimiters
  cleaned = cleaned
    .replace(/<\/?UNTRUSTED_USER_TEXT>/gi, '')
    .replace(/<\/?SYSTEM_INSTRUCTION>/gi, '')
    .replace(/<\|im_start\|>/gi, '')
    .replace(/<\|im_end\|>/gi, '');

  // 3. Collapse multiple whitespace / blank lines
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // 4. Truncate safely at Unicode code-point boundaries
  const characters = Array.from(cleaned);
  if (characters.length > maxChars) {
    return characters.slice(0, maxChars).join('').trim();
  }

  return cleaned;
}
