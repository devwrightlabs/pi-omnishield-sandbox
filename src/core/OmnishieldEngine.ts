import type {
  EngineConfiguration,
  EngineRequest,
  EngineResponse,
  EngineTelemetry,
  IsolatedContextState,
  SecurityScope
} from '../types/omnishield';
import { validatePctIsolation } from './pi-pct-compliance-guard';
import { PiMemorySafeSandbox } from './pi-memory-safe-sandbox';
import { PiBreachLogger } from '../debug/pi-breach-logger';
import { PiApiThrottle } from '../debug/pi-api-throttle';
import { sanitizePrompt } from '../security/pi-prompt-sanitizer';
import { detectJailbreak } from '../security/pi-jailbreak-detector';
import { createMaskedWalletAddress } from '../security/pi-wallet-mask';
import { parseAiIntent, shouldBlockIntent } from '../isolation/pi-intent-parser';
import { PiKillSwitch } from '../isolation/pi-kill-switch';

/**
 * Master zero-trust gateway between host Pi app and external AI model providers.
 */
export class OmnishieldEngine {
  private readonly context: IsolatedContextState;
  private readonly throttle: PiApiThrottle;
  private readonly memorySandbox: PiMemorySafeSandbox;
  private readonly breachLogger: PiBreachLogger;
  private readonly killSwitch: PiKillSwitch;
  private sanitizedRequests = 0;
  private blockedRequests = 0;
  private activeStreams = 0;

  public constructor(config: EngineConfiguration = {}) {
    const compliance = validatePctIsolation({ allowWindowPiAccess: false });
    if (!compliance.compliant) {
      throw new Error(compliance.reason);
    }

    const scope: SecurityScope = config.scope ?? 'CHAT_ONLY';
    this.context = {
      sessionId: config.sessionId ?? `shield-${crypto.randomUUID()}`,
      initializedAt: Date.now(),
      memoryBudgetBytes: config.memoryBudgetBytes ?? 256_000,
      currentMemoryBytes: 0,
      scope,
      isTerminated: false
    };

    this.throttle = new PiApiThrottle(config.maxRequestsPerMinute ?? 20);
    this.memorySandbox = new PiMemorySafeSandbox();
    this.breachLogger = new PiBreachLogger();
    this.killSwitch = new PiKillSwitch();
  }

  /**
   * Sanitizes and validates an outbound AI prompt.
   */
  public async secureRequest(request: EngineRequest): Promise<EngineResponse> {
    try {
      if (!this.throttle.allowRequest()) {
        this.blockedRequests += 1;
        return this.blocked('Request throttled to prevent runaway loops.');
      }

      const jailbreak = detectJailbreak(request.prompt);
      if (jailbreak.blocked) {
        this.blockedRequests += 1;
        this.breachLogger.log({
          category: 'SCOPE_ESCALATION',
          message: 'Prompt injection attempt blocked.',
          payload: { matches: jailbreak.matches },
          timestamp: Date.now()
        });
        return this.blocked('Prompt blocked by jailbreak detector.');
      }

      const sanitized = sanitizePrompt(request.prompt);
      if (sanitized.piiFound) {
        this.sanitizedRequests += 1;
      }

      const intent = parseAiIntent(sanitized.sanitizedPrompt);
      if (shouldBlockIntent(intent)) {
        this.blockedRequests += 1;
        this.breachLogger.log({
          category: 'PAYMENT',
          message: 'Unsafe model intent blocked.',
          payload: { intent },
          timestamp: Date.now()
        });
        return this.blocked('Intent parser flagged unsafe output pattern.');
      }

      return {
        accepted: true,
        outboundPrompt: sanitized.sanitizedPrompt,
        telemetry: this.getTelemetry()
      };
    } catch (error: unknown) {
      this.blockedRequests += 1;
      return this.blocked(error instanceof Error ? error.message : 'Unknown secureRequest error.');
    }
  }

  /**
   * Streams model output in safe chunks for mobile webview stability.
   */
  public async streamModelOutput(output: string, onChunk: (chunk: string) => void): Promise<void> {
    try {
      const controller = new AbortController();
      this.killSwitch.track(controller);
      this.activeStreams += 1;

      await this.memorySandbox.streamInChunks(output, (chunk) => {
        if (controller.signal.aborted) {
          return;
        }
        onChunk(chunk);
      });
      this.memorySandbox.requestGarbageCollection();
    } catch {
      this.blockedRequests += 1;
    } finally {
      this.activeStreams = Math.max(0, this.activeStreams - 1);
    }
  }

  /**
   * Replaces sensitive wallet address with deterministic dummy alias.
   */
  public maskWalletAddress(realAddress: string): string {
    try {
      return createMaskedWalletAddress(realAddress);
    } catch {
      return 'PI_DUMMY_00000000';
    }
  }

  /**
   * Immediately aborts all tracked stream operations.
   */
  public emergencyStop(reason?: string): number {
    try {
      return this.killSwitch.trigger(reason);
    } catch {
      return 0;
    }
  }

  /**
   * Returns current engine telemetry.
   */
  public getTelemetry(): EngineTelemetry {
    return {
      sessionId: this.context.sessionId,
      sanitizedRequests: this.sanitizedRequests,
      blockedRequests: this.blockedRequests,
      potentialBreaches: this.breachLogger.getCount(),
      activeStreams: this.activeStreams
    };
  }

  private blocked(reason: string): EngineResponse {
    return {
      accepted: false,
      blockedReason: reason,
      telemetry: this.getTelemetry()
    };
  }
}
