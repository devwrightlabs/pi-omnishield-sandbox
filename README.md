# @devright/pi-omnishield-sandbox

`@devright/pi-omnishield-sandbox` is a strictly typed TypeScript AI security firewall and sandbox for Pi Network webview apps.

## Security blueprint goals

- Enforce Pi Core Team-inspired isolation boundaries
- Prevent direct external model exposure to sensitive client state
- Sanitize prompts before any outbound request
- Guard against prompt-injection/jailbreak behavior
- Provide debugging, throttling, and emergency stop controls

## Install

```bash
npm install @devright/pi-omnishield-sandbox
```

## PCT-compliant encapsulation model

The `OmnishieldEngine` enforces a zero-trust pipeline:

1. `validatePctIsolation` checks runtime isolation assumptions
2. `PiApiThrottle` rate-limits requests to stop recursive AI billing loops
3. `detectJailbreak` blocks prompt-injection and jailbreak signatures
4. `sanitizePrompt` redacts common PII before model egress
5. `parseAiIntent` and `shouldBlockIntent` block unsafe payment/social-engineering output

## Prompt sanitizer

`sanitizePrompt` currently redacts:

- phone numbers
- email addresses
- Bahamian location references (for privacy-sensitive address contexts)

Every sanitization response includes metadata (`piiFound`, `redactionCount`) to support audit logging and shield telemetry.

## Breach debugger suite

- `PiBreachLogger`: normalized human-readable security warnings
- `PiApiThrottle`: hard per-minute request caps
- `PiCorsShield`: secure edge-proxy forwarding helper for CORS-constrained webviews

## React usage

```tsx
"use client";

import { OmnishieldProvider, SecureAiChatUI } from '@devright/pi-omnishield-sandbox';

export default function Page() {
  return (
    <OmnishieldProvider config={{ scope: 'CHAT_ONLY', maxRequestsPerMinute: 20 }}>
      <SecureAiChatUI />
    </OmnishieldProvider>
  );
}
```

## Build

```bash
npm run build
npm run typecheck
```
