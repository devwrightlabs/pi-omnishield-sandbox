"use client";

import React, { useMemo, useState } from 'react';
import { useOmnishield } from './useOmnishield';

export interface SecureAiChatUIProps {
  onPromptAccepted?: (sanitizedPrompt: string) => Promise<string>;
}

/**
 * Dark-mode chat interface with real-time Omnishield status visibility.
 */
export function SecureAiChatUI({ onPromptAccepted }: SecureAiChatUIProps): JSX.Element {
  const { secureRequest, getTelemetry } = useOmnishield();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<readonly string[]>([]);
  const [shieldStatus, setShieldStatus] = useState<'Protected' | 'Blocked'>('Protected');

  const telemetry = useMemo(() => getTelemetry(), [messages, getTelemetry]);

  async function submitPrompt(): Promise<void> {
    try {
      const result = await secureRequest({ prompt });
      if (!result.accepted || !result.outboundPrompt) {
        setShieldStatus('Blocked');
        setMessages((prev) => [...prev, `⛔ ${result.blockedReason ?? 'Prompt blocked.'}`]);
        return;
      }

      setShieldStatus('Protected');
      const response = onPromptAccepted
        ? await onPromptAccepted(result.outboundPrompt)
        : `Sanitized prompt sent securely: ${result.outboundPrompt}`;
      setMessages((prev) => [...prev, `🛡️ ${response}`]);
      setPrompt('');
    } catch (error: unknown) {
      setShieldStatus('Blocked');
      setMessages((prev) => [
        ...prev,
        `⛔ ${error instanceof Error ? error.message : 'Unknown chat submission error.'}`
      ]);
    }
  }

  return (
    <section
      style={{
        background: '#0A0A0F',
        color: '#F5F5F7',
        border: '1px solid #1E1E28',
        borderRadius: 12,
        padding: 16,
        fontFamily: 'Inter, system-ui, sans-serif',
        width: '100%',
        maxWidth: 640
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 18, color: '#F0C040' }}>Secure AI Chat</h2>
        <span
          style={{
            fontSize: 12,
            background: shieldStatus === 'Protected' ? '#1D3B2A' : '#522020',
            color: '#F0C040',
            borderRadius: 999,
            padding: '4px 10px'
          }}
        >
          Shield Status: {shieldStatus}
        </span>
      </header>

      <p style={{ marginTop: 8, color: '#B8B8C7', fontSize: 13 }}>
        Sanitized Requests: {telemetry.sanitizedRequests} · Blocked Requests: {telemetry.blockedRequests}
      </p>

      <div
        style={{
          minHeight: 140,
          margin: '12px 0',
          padding: 10,
          borderRadius: 10,
          border: '1px solid #1E1E28',
          background: '#11111A',
          overflowY: 'auto'
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: '#6F6F82', margin: 0 }}>No messages yet. Prompts are sanitized before send.</p>
        ) : (
          messages.map((message, index) => (
            <p key={`${message}-${index}`} style={{ margin: '0 0 8px', whiteSpace: 'pre-wrap' }}>
              {message}
            </p>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.currentTarget.value)}
          placeholder="Type secure prompt..."
          style={{
            flex: 1,
            borderRadius: 8,
            border: '1px solid #2A2A38',
            background: '#13131C',
            color: '#FFFFFF',
            padding: '10px 12px'
          }}
        />
        <button
          type="button"
          onClick={() => void submitPrompt()}
          style={{
            border: 0,
            borderRadius: 8,
            background: '#F0C040',
            color: '#0A0A0F',
            padding: '10px 14px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </section>
  );
}
