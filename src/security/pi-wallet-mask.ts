/**
 * Converts wallet identifiers to deterministic non-sensitive aliases.
 */
export function createMaskedWalletAddress(realAddress: string, prefix = 'PI_DUMMY_'): string {
  try {
    const compact = realAddress.replace(/\s+/g, '').slice(-8).toUpperCase();
    const suffix = compact.padStart(8, '0');
    return `${prefix}${suffix}`;
  } catch {
    return `${prefix}00000000`;
  }
}
