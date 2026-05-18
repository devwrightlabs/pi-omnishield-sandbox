import type { JailbreakScanResult } from '../types/omnishield';

const JAILBREAK_PATTERNS: readonly RegExp[] = [
  /ignore\s+all\s+previous\s+instructions/i,
  /developer\s+mode/i,
  /jailbreak/i,
  /pretend\s+to\s+be\s+unfiltered/i,
  /bypass\s+safety/i,
  /reveal\s+system\s+prompt/i
] as const;

/**
 * Detects common jailbreak and prompt-injection signatures.
 */
export function detectJailbreak(prompt: string): JailbreakScanResult {
  try {
    const matches = JAILBREAK_PATTERNS.filter((pattern) => pattern.test(prompt)).map(
      (pattern) => pattern.source
    );
    return {
      blocked: matches.length > 0,
      matches
    };
  } catch {
    return {
      blocked: true,
      matches: ['scanner_failure']
    };
  }
}
