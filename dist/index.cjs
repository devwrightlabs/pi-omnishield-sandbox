"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  OmnishieldEngine: () => OmnishieldEngine,
  OmnishieldProvider: () => OmnishieldProvider,
  PiApiThrottle: () => PiApiThrottle,
  PiBiometricVault: () => PiBiometricVault,
  PiBreachLogger: () => PiBreachLogger,
  PiCorsShield: () => PiCorsShield,
  PiCrossAppTunnel: () => PiCrossAppTunnel,
  PiKillSwitch: () => PiKillSwitch,
  PiMemorySafeSandbox: () => PiMemorySafeSandbox,
  SecureAiChatUI: () => SecureAiChatUI,
  blockEvalInScope: () => blockEvalInScope,
  createMaskedWalletAddress: () => createMaskedWalletAddress,
  detectJailbreak: () => detectJailbreak,
  parseAiIntent: () => parseAiIntent,
  sanitizePrompt: () => sanitizePrompt,
  shouldBlockIntent: () => shouldBlockIntent,
  useOmnishield: () => useOmnishield,
  validatePctIsolation: () => validatePctIsolation
});
module.exports = __toCommonJS(index_exports);

// src/core/pi-pct-compliance-guard.ts
function validatePctIsolation(options = {}) {
  try {
    const hasWindow = typeof window !== "undefined";
    const hasPiApi = hasWindow && "Pi" in window;
    if (hasPiApi && !options.allowWindowPiAccess) {
      return {
        compliant: false,
        reason: "Unauthorized access to window.Pi blocked by PCT compliance guard.",
        blockedAccessAttempts: 1
      };
    }
    return {
      compliant: true,
      reason: "Execution context is isolated and compliant.",
      blockedAccessAttempts: 0
    };
  } catch (error) {
    return {
      compliant: false,
      reason: error instanceof Error ? error.message : "Unknown compliance guard failure.",
      blockedAccessAttempts: 1
    };
  }
}

// src/core/pi-memory-safe-sandbox.ts
var PiMemorySafeSandbox = class {
  maxChunkSize;
  constructor(maxChunkSize = 1024) {
    this.maxChunkSize = Math.max(128, maxChunkSize);
  }
  /**
   * Streams text safely in small chunks and yields to the event loop per chunk.
   */
  async streamInChunks(input, onChunk) {
    try {
      let offset = 0;
      let chunks = 0;
      const totalBytes = new TextEncoder().encode(input).byteLength;
      while (offset < input.length) {
        const chunk = input.slice(offset, offset + this.maxChunkSize);
        onChunk(chunk);
        chunks += 1;
        offset += this.maxChunkSize;
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      return { chunks, totalBytes };
    } catch {
      return { chunks: 0, totalBytes: 0 };
    }
  }
  /**
   * Requests runtime garbage collection if supported by host environment.
   */
  requestGarbageCollection() {
    try {
      const maybeGlobal = globalThis;
      if (typeof maybeGlobal.gc === "function") {
        maybeGlobal.gc();
      }
    } catch {
    }
  }
};

// src/debug/pi-breach-logger.ts
var PiBreachLogger = class {
  breachCount = 0;
  /**
   * Logs a normalized breach event and tracks breach totals.
   */
  log(event) {
    try {
      this.breachCount += 1;
      console.warn(
        `[Omnishield][${event.category}] ${event.message}
Timestamp: ${new Date(event.timestamp).toISOString()}
Payload: ${JSON.stringify(event.payload, null, 2)}`
      );
    } catch {
      console.warn("[Omnishield] Breach event logging failed.");
    }
  }
  /**
   * Gets the number of breach events logged in this session.
   */
  getCount() {
    return this.breachCount;
  }
};

// src/debug/pi-api-throttle.ts
var PiApiThrottle = class {
  limit;
  windowMs;
  timestamps = [];
  constructor(limit = 30, windowMs = 6e4) {
    this.limit = Math.max(1, limit);
    this.windowMs = Math.max(1e3, windowMs);
  }
  /**
   * Returns true when request is within configured budget.
   */
  allowRequest(now = Date.now()) {
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
  getState(now = Date.now()) {
    this.prune(now);
    const oldest = this.timestamps[0] ?? now;
    return {
      requestCount: this.timestamps.length,
      limit: this.limit,
      windowMs: this.windowMs,
      resetAt: oldest + this.windowMs
    };
  }
  prune(now) {
    while (this.timestamps.length > 0 && now - this.timestamps[0] > this.windowMs) {
      this.timestamps.shift();
    }
  }
};

// src/security/pi-prompt-sanitizer.ts
var PHONE_REGEX = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
var EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
var BAHAMIAN_LOCATION_REGEX = /\b(?:Nassau|Freeport|New\sProvidence|Grand\sBahama|Bahamas)\b/gi;
function sanitizePrompt(prompt) {
  try {
    let redactionCount = 0;
    const replacements = [
      [PHONE_REGEX, "[REDACTED_PHONE]"],
      [EMAIL_REGEX, "[REDACTED_EMAIL]"],
      [BAHAMIAN_LOCATION_REGEX, "[REDACTED_LOCATION]"]
    ];
    let sanitizedPrompt = prompt;
    for (const [pattern, replacement] of replacements) {
      sanitizedPrompt = sanitizedPrompt.replace(pattern, () => {
        redactionCount += 1;
        return replacement;
      });
    }
    return {
      originalPrompt: prompt,
      sanitizedPrompt,
      piiFound: redactionCount > 0,
      redactionCount
    };
  } catch {
    return {
      originalPrompt: prompt,
      sanitizedPrompt: prompt,
      piiFound: false,
      redactionCount: 0
    };
  }
}

// src/security/pi-jailbreak-detector.ts
var JAILBREAK_PATTERNS = [
  /ignore\s+all\s+previous\s+instructions/i,
  /developer\s+mode/i,
  /jailbreak/i,
  /pretend\s+to\s+be\s+unfiltered/i,
  /bypass\s+safety/i,
  /reveal\s+system\s+prompt/i
];
function detectJailbreak(prompt) {
  try {
    const matches = JAILBREAK_PATTERNS.filter((pattern) => pattern.test(prompt)).map(
      (pattern) => pattern.source
    );
    return {
      blocked: matches.length > 0,
      matches
    };
  } catch {
    return {
      blocked: true,
      matches: ["scanner_failure"]
    };
  }
}

// src/security/pi-wallet-mask.ts
function createMaskedWalletAddress(realAddress, prefix = "PI_DUMMY_") {
  try {
    const compact = realAddress.replace(/\s+/g, "").slice(-8).toUpperCase();
    const suffix = compact.padStart(8, "0");
    return `${prefix}${suffix}`;
  } catch {
    return `${prefix}00000000`;
  }
}

// src/isolation/pi-intent-parser.ts
var PAYMENT_LURE_REGEX = /\b(send|transfer|pay|tip|donate)\b/i;
var URGENCY_REGEX = /\b(immediately|urgent|now|asap)\b/i;
function parseAiIntent(rawOutput) {
  try {
    const requestsPayment = PAYMENT_LURE_REGEX.test(rawOutput);
    return {
      intent: requestsPayment ? "payment_related" : "informational",
      confidence: requestsPayment ? 0.85 : 0.3,
      rawOutput,
      requestsPayment,
      requestsSensitiveData: /\b(private\s*key|seed\s*phrase|password|otp)\b/i.test(rawOutput),
      referencesWalletAddress: /\b(pi[0-9a-z]{10,})\b/i.test(rawOutput) || /wallet\s+address/i.test(rawOutput)
    };
  } catch {
    return {
      intent: "unknown",
      confidence: 0,
      rawOutput,
      requestsPayment: false,
      requestsSensitiveData: false,
      referencesWalletAddress: false
    };
  }
}
function shouldBlockIntent(intent) {
  try {
    return intent.requestsPayment || intent.requestsSensitiveData || intent.referencesWalletAddress && intent.confidence >= 0.5 || URGENCY_REGEX.test(intent.rawOutput);
  } catch {
    return true;
  }
}

// src/isolation/pi-kill-switch.ts
var PiKillSwitch = class {
  controllers = /* @__PURE__ */ new Set();
  callbacks = /* @__PURE__ */ new Set();
  /**
   * Registers an abort controller to be canceled on kill-switch trigger.
   */
  track(controller) {
    try {
      this.controllers.add(controller);
    } catch {
    }
  }
  /**
   * Registers a callback executed during emergency termination.
   */
  registerCallback(callback) {
    try {
      this.callbacks.add(callback);
    } catch {
    }
  }
  /**
   * Aborts all tracked streams and returns total aborted controller count.
   */
  trigger(reason = "Emergency stop invoked") {
    let aborted = 0;
    for (const controller of this.controllers) {
      try {
        controller.abort(reason);
        aborted += 1;
      } catch {
      }
    }
    for (const callback of this.callbacks) {
      try {
        callback();
      } catch {
      }
    }
    this.controllers.clear();
    this.callbacks.clear();
    return aborted;
  }
};

// src/core/OmnishieldEngine.ts
var OmnishieldEngine = class {
  context;
  throttle;
  memorySandbox;
  breachLogger;
  killSwitch;
  sanitizedRequests = 0;
  blockedRequests = 0;
  activeStreams = 0;
  constructor(config = {}) {
    const compliance = validatePctIsolation({ allowWindowPiAccess: false });
    if (!compliance.compliant) {
      throw new Error(compliance.reason);
    }
    const scope = config.scope ?? "CHAT_ONLY";
    this.context = {
      sessionId: config.sessionId ?? `shield-${crypto.randomUUID()}`,
      initializedAt: Date.now(),
      memoryBudgetBytes: config.memoryBudgetBytes ?? 256e3,
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
  async secureRequest(request) {
    try {
      if (!this.throttle.allowRequest()) {
        this.blockedRequests += 1;
        return this.blocked("Request throttled to prevent runaway loops.");
      }
      const jailbreak = detectJailbreak(request.prompt);
      if (jailbreak.blocked) {
        this.blockedRequests += 1;
        this.breachLogger.log({
          category: "SCOPE_ESCALATION",
          message: "Prompt injection attempt blocked.",
          payload: { matches: jailbreak.matches },
          timestamp: Date.now()
        });
        return this.blocked("Prompt blocked by jailbreak detector.");
      }
      const sanitized = sanitizePrompt(request.prompt);
      if (sanitized.piiFound) {
        this.sanitizedRequests += 1;
      }
      const intent = parseAiIntent(sanitized.sanitizedPrompt);
      if (shouldBlockIntent(intent)) {
        this.blockedRequests += 1;
        this.breachLogger.log({
          category: "PAYMENT",
          message: "Unsafe model intent blocked.",
          payload: { intent },
          timestamp: Date.now()
        });
        return this.blocked("Intent parser flagged unsafe output pattern.");
      }
      return {
        accepted: true,
        outboundPrompt: sanitized.sanitizedPrompt,
        telemetry: this.getTelemetry()
      };
    } catch (error) {
      this.blockedRequests += 1;
      return this.blocked(error instanceof Error ? error.message : "Unknown secureRequest error.");
    }
  }
  /**
   * Streams model output in safe chunks for mobile webview stability.
   */
  async streamModelOutput(output, onChunk) {
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
  maskWalletAddress(realAddress) {
    try {
      return createMaskedWalletAddress(realAddress);
    } catch {
      return "PI_DUMMY_00000000";
    }
  }
  /**
   * Immediately aborts all tracked stream operations.
   */
  emergencyStop(reason) {
    try {
      return this.killSwitch.trigger(reason);
    } catch {
      return 0;
    }
  }
  /**
   * Returns current engine telemetry.
   */
  getTelemetry() {
    return {
      sessionId: this.context.sessionId,
      sanitizedRequests: this.sanitizedRequests,
      blockedRequests: this.blockedRequests,
      potentialBreaches: this.breachLogger.getCount(),
      activeStreams: this.activeStreams
    };
  }
  blocked(reason) {
    return {
      accepted: false,
      blockedReason: reason,
      telemetry: this.getTelemetry()
    };
  }
};

// src/debug/pi-cors-shield.ts
var PiCorsShield = class {
  proxyEndpoint;
  constructor(proxyEndpoint) {
    this.proxyEndpoint = proxyEndpoint;
  }
  /**
   * Sends target request via proxy to avoid direct mobile-webview CORS failures.
   */
  async forward(request) {
    try {
      return await fetch(this.proxyEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          targetUrl: request.url,
          method: request.method ?? "POST",
          headers: request.headers ?? {},
          body: request.body ?? null
        })
      });
    } catch (error) {
      throw new Error(
        `PiCorsShield forward failed: ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }
};

// src/security/pi-biometric-vault.ts
var PiBiometricVault = class {
  provider;
  constructor(provider) {
    this.provider = provider;
  }
  /**
   * Executes an action only after successful biometric verification.
   */
  async authorize(reason, action) {
    try {
      const verified = await this.provider.verify(reason);
      if (!verified) {
        throw new Error("Biometric verification rejected.");
      }
      return await action();
    } catch (error) {
      throw new Error(
        `Biometric vault blocked action: ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }
};

// src/isolation/pi-script-eval-blocker.ts
function blockEvalInScope(scope = globalThis) {
  const originalEval = scope.eval;
  try {
    scope.eval = () => {
      throw new Error("eval() is disabled by Pi script execution policy.");
    };
  } catch {
  }
  return {
    restore() {
      try {
        scope.eval = originalEval;
      } catch {
      }
    }
  };
}

// src/isolation/pi-cross-app-tunnel.ts
var PiCrossAppTunnel = class _PiCrossAppTunnel {
  key;
  transport;
  constructor(key, transport) {
    this.key = key;
    this.transport = transport;
  }
  /**
   * Creates a tunnel using AES-GCM key material derived from shared secret.
   */
  static async create(sharedSecret, transport) {
    const encodedSecret = new TextEncoder().encode(sharedSecret.padEnd(32, "0").slice(0, 32));
    const key = await crypto.subtle.importKey("raw", encodedSecret, "AES-GCM", false, ["encrypt", "decrypt"]);
    return new _PiCrossAppTunnel(key, transport);
  }
  /**
   * Encrypts and sends a message payload.
   */
  async send(message) {
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(JSON.stringify(message));
      const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, this.key, encoded);
      await this.transport.send(
        JSON.stringify({
          iv: Array.from(iv),
          cipher: Array.from(new Uint8Array(encrypted))
        })
      );
    } catch (error) {
      throw new Error(
        `Failed to send encrypted message: ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }
  /**
   * Receives and decrypts a message payload.
   */
  async receive() {
    try {
      const raw = await this.transport.receive();
      const parsed = JSON.parse(raw);
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(parsed.iv) },
        this.key,
        new Uint8Array(parsed.cipher)
      );
      return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (error) {
      throw new Error(
        `Failed to receive encrypted message: ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }
};

// src/react/OmnishieldProvider.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var OmnishieldContext = (0, import_react.createContext)(null);
function OmnishieldProvider({
  children,
  config
}) {
  const engine = (0, import_react.useMemo)(() => {
    try {
      return new OmnishieldEngine(config);
    } catch {
      return new OmnishieldEngine({
        ...config,
        scope: "READ_ONLY"
      });
    }
  }, [config]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OmnishieldContext.Provider, { value: { engine }, children });
}
function useOmnishieldContext() {
  const context = (0, import_react.useContext)(OmnishieldContext);
  if (!context) {
    throw new Error("useOmnishieldContext must be used inside OmnishieldProvider.");
  }
  return context;
}

// src/react/useOmnishield.ts
var import_react2 = require("react");
function useOmnishield() {
  const { engine } = useOmnishieldContext();
  const secureRequest = (0, import_react2.useCallback)(
    async (request) => {
      try {
        return await engine.secureRequest(request);
      } catch (error) {
        return {
          accepted: false,
          blockedReason: error instanceof Error ? error.message : "Unknown secure request error.",
          telemetry: engine.getTelemetry()
        };
      }
    },
    [engine]
  );
  const emergencyStop = (0, import_react2.useCallback)(
    (reason) => {
      try {
        return engine.emergencyStop(reason);
      } catch {
        return 0;
      }
    },
    [engine]
  );
  const getTelemetry = (0, import_react2.useCallback)(() => engine.getTelemetry(), [engine]);
  return {
    secureRequest,
    emergencyStop,
    getTelemetry
  };
}

// src/react/SecureAiChatUI.tsx
var import_react3 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
function SecureAiChatUI({ onPromptAccepted }) {
  const { secureRequest, getTelemetry } = useOmnishield();
  const [prompt, setPrompt] = (0, import_react3.useState)("");
  const [messages, setMessages] = (0, import_react3.useState)([]);
  const [shieldStatus, setShieldStatus] = (0, import_react3.useState)("Protected");
  const telemetry = (0, import_react3.useMemo)(() => getTelemetry(), [messages, getTelemetry]);
  async function submitPrompt() {
    try {
      const result = await secureRequest({ prompt });
      if (!result.accepted || !result.outboundPrompt) {
        setShieldStatus("Blocked");
        setMessages((prev) => [...prev, `\u26D4 ${result.blockedReason ?? "Prompt blocked."}`]);
        return;
      }
      setShieldStatus("Protected");
      const response = onPromptAccepted ? await onPromptAccepted(result.outboundPrompt) : `Sanitized prompt sent securely: ${result.outboundPrompt}`;
      setMessages((prev) => [...prev, `\u{1F6E1}\uFE0F ${response}`]);
      setPrompt("");
    } catch (error) {
      setShieldStatus("Blocked");
      setMessages((prev) => [
        ...prev,
        `\u26D4 ${error instanceof Error ? error.message : "Unknown chat submission error."}`
      ]);
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "section",
    {
      style: {
        background: "#0A0A0F",
        color: "#F5F5F7",
        border: "1px solid #1E1E28",
        borderRadius: 12,
        padding: 16,
        fontFamily: "Inter, system-ui, sans-serif",
        width: "100%",
        maxWidth: 640
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("header", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { style: { margin: 0, fontSize: 18, color: "#F0C040" }, children: "Secure AI Chat" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
            "span",
            {
              style: {
                fontSize: 12,
                background: shieldStatus === "Protected" ? "#1D3B2A" : "#522020",
                color: "#F0C040",
                borderRadius: 999,
                padding: "4px 10px"
              },
              children: [
                "Shield Status: ",
                shieldStatus
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { style: { marginTop: 8, color: "#B8B8C7", fontSize: 13 }, children: [
          "Sanitized Requests: ",
          telemetry.sanitizedRequests,
          " \xB7 Blocked Requests: ",
          telemetry.blockedRequests
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "div",
          {
            style: {
              minHeight: 140,
              margin: "12px 0",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #1E1E28",
              background: "#11111A",
              overflowY: "auto"
            },
            children: messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { color: "#6F6F82", margin: 0 }, children: "No messages yet. Prompts are sanitized before send." }) : messages.map((message, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { margin: "0 0 8px", whiteSpace: "pre-wrap" }, children: message }, `${message}-${index}`))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "input",
            {
              value: prompt,
              onChange: (event) => setPrompt(event.currentTarget.value),
              placeholder: "Type secure prompt...",
              style: {
                flex: 1,
                borderRadius: 8,
                border: "1px solid #2A2A38",
                background: "#13131C",
                color: "#FFFFFF",
                padding: "10px 12px"
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              type: "button",
              onClick: () => void submitPrompt(),
              style: {
                border: 0,
                borderRadius: 8,
                background: "#F0C040",
                color: "#0A0A0F",
                padding: "10px 14px",
                fontWeight: 700,
                cursor: "pointer"
              },
              children: "Send"
            }
          )
        ] })
      ]
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OmnishieldEngine,
  OmnishieldProvider,
  PiApiThrottle,
  PiBiometricVault,
  PiBreachLogger,
  PiCorsShield,
  PiCrossAppTunnel,
  PiKillSwitch,
  PiMemorySafeSandbox,
  SecureAiChatUI,
  blockEvalInScope,
  createMaskedWalletAddress,
  detectJailbreak,
  parseAiIntent,
  sanitizePrompt,
  shouldBlockIntent,
  useOmnishield,
  validatePctIsolation
});
//# sourceMappingURL=index.cjs.map