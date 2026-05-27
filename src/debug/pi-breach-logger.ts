import type { BreachEvent } from '../types/omnishield';

/**
 * Emits readable console warnings when unsafe AI behavior is intercepted.
 */
export class PiBreachLogger {
  private breachCount = 0;

  /**
   * Logs a normalized breach event and tracks breach totals.
   */
  public log(event: BreachEvent): void {
    try {
      this.breachCount += 1;
      console.warn(
        `[Omnishield][${event.category}] ${event.message}\n` +
          `Timestamp: ${new Date(event.timestamp).toISOString()}\n` +
          `Payload: ${JSON.stringify(event.payload, null, 2)}`
      );
    } catch {
      console.warn('[Omnishield] Breach event logging failed.');
    }
  }

  /**
   * Gets the number of breach events logged in this session.
   */
  public getCount(): number {
    return this.breachCount;
  }
}
