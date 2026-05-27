import type { PctComplianceResult } from '../types/omnishield';

export interface PctGuardOptions {
  allowWindowPiAccess?: boolean;
}

/**
 * Validates whether runtime isolation follows Pi Core Team-style guardrails.
 */
export function validatePctIsolation(options: PctGuardOptions = {}): PctComplianceResult {
  try {
    const hasWindow = typeof window !== 'undefined';
    const hasPiApi = hasWindow && 'Pi' in window;

    if (hasPiApi && !options.allowWindowPiAccess) {
      return {
        compliant: false,
        reason: 'Unauthorized access to window.Pi blocked by PCT compliance guard.',
        blockedAccessAttempts: 1
      };
    }

    return {
      compliant: true,
      reason: 'Execution context is isolated and compliant.',
      blockedAccessAttempts: 0
    };
  } catch (error: unknown) {
    return {
      compliant: false,
      reason: error instanceof Error ? error.message : 'Unknown compliance guard failure.',
      blockedAccessAttempts: 1
    };
  }
}
