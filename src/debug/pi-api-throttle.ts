import type { ApiThrottleState } from '../types/omnishield';

/**
 * Per-minute hard limiter for outbound model requests.
 */
export class PiApiThrottle {
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly timestamps: number[] = [];

  public constructor(limit = 30, windowMs = 60_000) {
    this.limit = Math.max(1, limit);
    this.windowMs = Math.max(1_000, windowMs);
  }

  /**
   * Returns true when request is within configured budget.
   */
  public allowRequest(now = Date.now()): boolean {
    try {
      this.prune(now);
      if (this.timestamps.length >= this.limit) {
        return false;
      }
      this.timestamps.push(now);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Provides current throttle telemetry.
   */
  public getState(now = Date.now()): ApiThrottleState {
    this.prune(now);
    const oldest = this.timestamps[0] ?? now;
    return {
      requestCount: this.timestamps.length,
      limit: this.limit,
      windowMs: this.windowMs,
      resetAt: oldest + this.windowMs
    };
  }

  private prune(now: number): void {
    while (this.timestamps.length > 0 && now - this.timestamps[0]! > this.windowMs) {
      this.timestamps.shift();
    }
  }
}
