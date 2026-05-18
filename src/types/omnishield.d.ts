export type SecurityScope =
  | 'READ_ONLY'
  | 'CHAT_ONLY'
  | 'TRANSACTION_GUARDED'
  | 'HARDWARE_VERIFIED';

export interface IsolatedContextState {
  readonly sessionId: string;
  readonly initializedAt: number;
  readonly memoryBudgetBytes: number;
  readonly currentMemoryBytes: number;
  readonly scope: SecurityScope;
  readonly isTerminated: boolean;
}

export interface AiIntentPayload {
  readonly intent: string;
  readonly confidence: number;
  readonly rawOutput: string;
  readonly requestsPayment: boolean;
  readonly requestsSensitiveData: boolean;
  readonly referencesWalletAddress: boolean;
}

export interface SanitizationResult {
  readonly originalPrompt: string;
  readonly sanitizedPrompt: string;
  readonly piiFound: boolean;
  readonly redactionCount: number;
}

export interface JailbreakScanResult {
  readonly blocked: boolean;
  readonly matches: readonly string[];
}

export interface PctComplianceResult {
  readonly compliant: boolean;
  readonly reason: string;
  readonly blockedAccessAttempts: number;
}

export interface ApiThrottleState {
  readonly requestCount: number;
  readonly limit: number;
  readonly windowMs: number;
  readonly resetAt: number;
}

export interface BreachEvent {
  readonly category: 'PAYMENT' | 'SENSITIVE_DATA' | 'SCOPE_ESCALATION' | 'UNAUTHORIZED_API';
  readonly message: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly timestamp: number;
}

export interface EngineTelemetry {
  readonly sessionId: string;
  readonly sanitizedRequests: number;
  readonly blockedRequests: number;
  readonly potentialBreaches: number;
  readonly activeStreams: number;
}

export interface EngineConfiguration {
  readonly sessionId?: string;
  readonly scope?: SecurityScope;
  readonly maxRequestsPerMinute?: number;
  readonly memoryBudgetBytes?: number;
  readonly corsProxyUrl?: string;
  readonly walletMaskPrefix?: string;
}

export interface EngineRequest {
  readonly prompt: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface EngineResponse {
  readonly accepted: boolean;
  readonly blockedReason?: string;
  readonly outboundPrompt?: string;
  readonly telemetry: EngineTelemetry;
}
