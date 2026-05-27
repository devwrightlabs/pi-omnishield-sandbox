export interface BiometricProvider {
  verify(prompt: string): Promise<boolean>;
}

/**
 * Protects high-risk operations behind native biometric approval.
 */
export class PiBiometricVault {
  private readonly provider: BiometricProvider;

  public constructor(provider: BiometricProvider) {
    this.provider = provider;
  }

  /**
   * Executes an action only after successful biometric verification.
   */
  public async authorize<T>(reason: string, action: () => Promise<T>): Promise<T> {
    try {
      const verified = await this.provider.verify(reason);
      if (!verified) {
        throw new Error('Biometric verification rejected.');
      }
      return await action();
    } catch (error: unknown) {
      throw new Error(
        `Biometric vault blocked action: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  }
}
