/**
 * Global emergency stop utility for active AI stream operations.
 */
export class PiKillSwitch {
  private readonly controllers = new Set<AbortController>();
  private readonly callbacks = new Set<() => void>();

  /**
   * Registers an abort controller to be canceled on kill-switch trigger.
   */
  public track(controller: AbortController): void {
    try {
      this.controllers.add(controller);
    } catch {
      // Ignore registration failure to preserve stream continuity.
    }
  }

  /**
   * Registers a callback executed during emergency termination.
   */
  public registerCallback(callback: () => void): void {
    try {
      this.callbacks.add(callback);
    } catch {
      // Ignore callback registration failure.
    }
  }

  /**
   * Aborts all tracked streams and returns total aborted controller count.
   */
  public trigger(reason = 'Emergency stop invoked'): number {
    let aborted = 0;

    for (const controller of this.controllers) {
      try {
        controller.abort(reason);
        aborted += 1;
      } catch {
        // Ignore per-controller failure.
      }
    }

    for (const callback of this.callbacks) {
      try {
        callback();
      } catch {
        // Ignore per-callback failure.
      }
    }

    this.controllers.clear();
    this.callbacks.clear();
    return aborted;
  }
}
