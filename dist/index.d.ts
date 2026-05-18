import { PropsWithChildren } from 'react';

type SecurityScope =
  | 'READ_ONLY'
  | 'CHAT_ONLY'
  | 'TRANSACTION_GUARDED'
  | 'HARDWARE_VERIFIED';

interface IsolatedContextState {
  readonly sessionId: string;
  readonly initializedAt: number;
  readonly memoryBudgetBytes: number;
  readonly currentMemoryBytes: number;
  readonly scope: SecurityScope;
  readonly isTerminated: boolean;
}

interface AiIntentPayload {
  readonly intent: string;
  readonly confidence: number;
  readonly rawOutput: string;
  readonly requestsPayment: boolean;
  readonly requestsSensitiveData: boolean;
  readonly referencesWalletAddress: boolean;
}

interface SanitizationResult {
  readonly originalPrompt: string;
  readonly sanitizedPrompt: string;
  readonly piiFound: boolean;
  readonly redactionCount: number;
}

interface JailbreakScanResult {
  readonly blocked: boolean;
  readonly matches: readonly string[];
}

interface PctComplianceResult {
  readonly compliant: boolean;
  readonly reason: string;
  readonly blockedAccessAttempts: number;
}

interface ApiThrottleState {
  readonly requestCount: number;
  readonly limit: number;
  readonly windowMs: number;
  readonly resetAt: number;
}

interface BreachEvent {
  readonly category: 'PAYMENT' | 'SENSITIVE_DATA' | 'SCOPE_ESCALATION' | 'UNAUTHORIZED_API';
  readonly message: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly timestamp: number;
}

interface EngineTelemetry {
  readonly sessionId: string;
  readonly sanitizedRequests: number;
  readonly blockedRequests: number;
  readonly potentialBreaches: number;
  readonly activeStreams: number;
}

interface EngineConfiguration {
  readonly sessionId?: string;
  readonly scope?: SecurityScope;
  readonly maxRequestsPerMinute?: number;
  readonly memoryBudgetBytes?: number;
  readonly corsProxyUrl?: string;
  readonly walletMaskPrefix?: string;
}

interface EngineRequest {
  readonly prompt: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

interface EngineResponse {
  readonly accepted: boolean;
  readonly blockedReason?: string;
  readonly outboundPrompt?: string;
  readonly telemetry: EngineTelemetry;
}

/**
 * Master zero-trust gateway between host Pi app and external AI model providers.
 */
declare class OmnishieldEngine {
    private readonly context;
    private readonly throttle;
    private readonly memorySandbox;
    private readonly breachLogger;
    private readonly killSwitch;
    private sanitizedRequests;
    private blockedRequests;
    private activeStreams;
    constructor(config?: EngineConfiguration);
    /**
     * Sanitizes and validates an outbound AI prompt.
     */
    secureRequest(request: EngineRequest): Promise<EngineResponse>;
    /**
     * Streams model output in safe chunks for mobile webview stability.
     */
    streamModelOutput(output: string, onChunk: (chunk: string) => void): Promise<void>;
    /**
     * Replaces sensitive wallet address with deterministic dummy alias.
     */
    maskWalletAddress(realAddress: string): string;
    /**
     * Immediately aborts all tracked stream operations.
     */
    emergencyStop(reason?: string): number;
    /**
     * Returns current engine telemetry.
     */
    getTelemetry(): EngineTelemetry;
    private blocked;
}

interface PctGuardOptions {
    allowWindowPiAccess?: boolean;
}
/**
 * Validates whether runtime isolation follows Pi Core Team-style guardrails.
 */
declare function validatePctIsolation(options?: PctGuardOptions): PctComplianceResult;

/**
 * Chunks large model output so constrained mobile webviews remain responsive.
 */
declare class PiMemorySafeSandbox {
    private readonly maxChunkSize;
    constructor(maxChunkSize?: number);
    /**
     * Streams text safely in small chunks and yields to the event loop per chunk.
     */
    streamInChunks(input: string, onChunk: (chunk: string) => void): Promise<{
        chunks: number;
        totalBytes: number;
    }>;
    /**
     * Requests runtime garbage collection if supported by host environment.
     */
    requestGarbageCollection(): void;
}

/**
 * Emits readable console warnings when unsafe AI behavior is intercepted.
 */
declare class PiBreachLogger {
    private breachCount;
    /**
     * Logs a normalized breach event and tracks breach totals.
     */
    log(event: BreachEvent): void;
    /**
     * Gets the number of breach events logged in this session.
     */
    getCount(): number;
}

/**
 * Per-minute hard limiter for outbound model requests.
 */
declare class PiApiThrottle {
    private readonly limit;
    private readonly windowMs;
    private readonly timestamps;
    constructor(limit?: number, windowMs?: number);
    /**
     * Returns true when request is within configured budget.
     */
    allowRequest(now?: number): boolean;
    /**
     * Provides current throttle telemetry.
     */
    getState(now?: number): ApiThrottleState;
    private prune;
}

interface CorsShieldRequest {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Readonly<Record<string, string>>;
    body?: string;
}
/**
 * Forwards model API calls through a secure edge proxy endpoint.
 */
declare class PiCorsShield {
    private readonly proxyEndpoint;
    constructor(proxyEndpoint: string);
    /**
     * Sends target request via proxy to avoid direct mobile-webview CORS failures.
     */
    forward(request: CorsShieldRequest): Promise<Response>;
}

interface BiometricProvider {
    verify(prompt: string): Promise<boolean>;
}
/**
 * Protects high-risk operations behind native biometric approval.
 */
declare class PiBiometricVault {
    private readonly provider;
    constructor(provider: BiometricProvider);
    /**
     * Executes an action only after successful biometric verification.
     */
    authorize<T>(reason: string, action: () => Promise<T>): Promise<T>;
}

/**
 * Redacts high-risk PII from user prompts before outbound model requests.
 */
declare function sanitizePrompt(prompt: string): SanitizationResult;

/**
 * Converts wallet identifiers to deterministic non-sensitive aliases.
 */
declare function createMaskedWalletAddress(realAddress: string, prefix?: string): string;

/**
 * Detects common jailbreak and prompt-injection signatures.
 */
declare function detectJailbreak(prompt: string): JailbreakScanResult;

/**
 * Global emergency stop utility for active AI stream operations.
 */
declare class PiKillSwitch {
    private readonly controllers;
    private readonly callbacks;
    /**
     * Registers an abort controller to be canceled on kill-switch trigger.
     */
    track(controller: AbortController): void;
    /**
     * Registers a callback executed during emergency termination.
     */
    registerCallback(callback: () => void): void;
    /**
     * Aborts all tracked streams and returns total aborted controller count.
     */
    trigger(reason?: string): number;
}

interface EvalBlockHandle {
    restore(): void;
}
interface MutableEvalScope {
    eval: ((source: string) => unknown) | undefined;
}
/**
 * Disables eval within a target scope to prevent arbitrary code execution.
 */
declare function blockEvalInScope(scope?: MutableEvalScope): EvalBlockHandle;

interface CrossAppMessage {
    contextId: string;
    payload: string;
    sentAt: number;
}
interface CrossAppTransport {
    send(message: string): Promise<void>;
    receive(): Promise<string>;
}
/**
 * Encrypted cross-app tunnel for sharing AI context between isolated Pi apps.
 */
declare class PiCrossAppTunnel {
    private readonly key;
    private readonly transport;
    private constructor();
    /**
     * Creates a tunnel using AES-GCM key material derived from shared secret.
     */
    static create(sharedSecret: string, transport: CrossAppTransport): Promise<PiCrossAppTunnel>;
    /**
     * Encrypts and sends a message payload.
     */
    send(message: CrossAppMessage): Promise<void>;
    /**
     * Receives and decrypts a message payload.
     */
    receive(): Promise<CrossAppMessage>;
}

/**
 * Analyzes model output for risky payment-related social engineering intent.
 */
declare function parseAiIntent(rawOutput: string): AiIntentPayload;
/**
 * Returns true when parsed intent indicates unsafe behavior.
 */
declare function shouldBlockIntent(intent: AiIntentPayload): boolean;

/**
 * React provider that initializes OmnishieldEngine and secures app-level AI boundaries.
 */
declare function OmnishieldProvider({ children, config }: PropsWithChildren<{
    config?: EngineConfiguration;
}>): JSX.Element;

interface UseOmnishieldResult {
    secureRequest: (request: EngineRequest) => Promise<EngineResponse>;
    emergencyStop: (reason?: string) => number;
    getTelemetry: () => EngineTelemetry;
}
/**
 * Hook exposing safe Omnishield engine methods to React components.
 */
declare function useOmnishield(): UseOmnishieldResult;

interface SecureAiChatUIProps {
    onPromptAccepted?: (sanitizedPrompt: string) => Promise<string>;
}
/**
 * Dark-mode chat interface with real-time Omnishield status visibility.
 */
declare function SecureAiChatUI({ onPromptAccepted }: SecureAiChatUIProps): JSX.Element;

export { type AiIntentPayload, type ApiThrottleState, type BreachEvent, type EngineConfiguration, type EngineRequest, type EngineResponse, type EngineTelemetry, type IsolatedContextState, type JailbreakScanResult, OmnishieldEngine, OmnishieldProvider, type PctComplianceResult, PiApiThrottle, PiBiometricVault, PiBreachLogger, PiCorsShield, PiCrossAppTunnel, PiKillSwitch, PiMemorySafeSandbox, type SanitizationResult, SecureAiChatUI, type SecurityScope, blockEvalInScope, createMaskedWalletAddress, detectJailbreak, parseAiIntent, sanitizePrompt, shouldBlockIntent, useOmnishield, validatePctIsolation };
