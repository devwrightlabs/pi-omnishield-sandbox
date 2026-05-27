import type { AiIntentPayload } from '../types/omnishield';

const PAYMENT_LURE_REGEX = /\b(send|transfer|pay|tip|donate)\b/i;
const URGENCY_REGEX = /\b(immediately|urgent|now|asap)\b/i;

/**
 * Analyzes model output for risky payment-related social engineering intent.
 */
export function parseAiIntent(rawOutput: string): AiIntentPayload {
  try {
    const requestsPayment = PAYMENT_LURE_REGEX.test(rawOutput);

    return {
      intent: requestsPayment ? 'payment_related' : 'informational',
      confidence: requestsPayment ? 0.85 : 0.3,
      rawOutput,
      requestsPayment,
      requestsSensitiveData: /\b(private\s*key|seed\s*phrase|password|otp)\b/i.test(rawOutput),
      referencesWalletAddress: /\b(pi[0-9a-z]{10,})\b/i.test(rawOutput) || /wallet\s+address/i.test(rawOutput)
    };
  } catch {
    return {
      intent: 'unknown',
      confidence: 0,
      rawOutput,
      requestsPayment: false,
      requestsSensitiveData: false,
      referencesWalletAddress: false
    };
  }
}

/**
 * Returns true when parsed intent indicates unsafe behavior.
 */
export function shouldBlockIntent(intent: AiIntentPayload): boolean {
  try {
    return (
      intent.requestsPayment ||
      intent.requestsSensitiveData ||
      (intent.referencesWalletAddress && intent.confidence >= 0.5) ||
      URGENCY_REGEX.test(intent.rawOutput)
    );
  } catch {
    return true;
  }
}
