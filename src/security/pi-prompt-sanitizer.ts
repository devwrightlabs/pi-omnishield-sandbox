import type { SanitizationResult } from '../types/omnishield';

const PHONE_REGEX = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const BAHAMIAN_LOCATION_REGEX =
  /\b(?:Nassau|Freeport|New\sProvidence|Grand\sBahama|Bahamas)\b/gi;

/**
 * Redacts high-risk PII from user prompts before outbound model requests.
 */
export function sanitizePrompt(prompt: string): SanitizationResult {
  try {
    let redactionCount = 0;
    const replacements: Array<[RegExp, string]> = [
      [PHONE_REGEX, '[REDACTED_PHONE]'],
      [EMAIL_REGEX, '[REDACTED_EMAIL]'],
      [BAHAMIAN_LOCATION_REGEX, '[REDACTED_LOCATION]']
    ];

    let sanitizedPrompt = prompt;
    for (const [pattern, replacement] of replacements) {
      sanitizedPrompt = sanitizedPrompt.replace(pattern, () => {
        redactionCount += 1;
        return replacement;
      });
    }

    return {
      originalPrompt: prompt,
      sanitizedPrompt,
      piiFound: redactionCount > 0,
      redactionCount
    };
  } catch {
    return {
      originalPrompt: prompt,
      sanitizedPrompt: prompt,
      piiFound: false,
      redactionCount: 0
    };
  }
}
