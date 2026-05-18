export { OmnishieldEngine } from './core/OmnishieldEngine';
export { validatePctIsolation } from './core/pi-pct-compliance-guard';
export { PiMemorySafeSandbox } from './core/pi-memory-safe-sandbox';

export { PiBreachLogger } from './debug/pi-breach-logger';
export { PiApiThrottle } from './debug/pi-api-throttle';
export { PiCorsShield } from './debug/pi-cors-shield';

export { PiBiometricVault } from './security/pi-biometric-vault';
export { sanitizePrompt } from './security/pi-prompt-sanitizer';
export { createMaskedWalletAddress } from './security/pi-wallet-mask';
export { detectJailbreak } from './security/pi-jailbreak-detector';

export { PiKillSwitch } from './isolation/pi-kill-switch';
export { blockEvalInScope } from './isolation/pi-script-eval-blocker';
export { PiCrossAppTunnel } from './isolation/pi-cross-app-tunnel';
export { parseAiIntent, shouldBlockIntent } from './isolation/pi-intent-parser';

export { OmnishieldProvider } from './react/OmnishieldProvider';
export { useOmnishield } from './react/useOmnishield';
export { SecureAiChatUI } from './react/SecureAiChatUI';

export type {
  SecurityScope,
  IsolatedContextState,
  AiIntentPayload,
  SanitizationResult,
  JailbreakScanResult,
  PctComplianceResult,
  ApiThrottleState,
  BreachEvent,
  EngineTelemetry,
  EngineConfiguration,
  EngineRequest,
  EngineResponse
} from './types/omnishield';
