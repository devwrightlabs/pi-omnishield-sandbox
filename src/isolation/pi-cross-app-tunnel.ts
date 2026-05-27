export interface CrossAppMessage {
  contextId: string;
  payload: string;
  sentAt: number;
}

export interface CrossAppTransport {
  send(message: string): Promise<void>;
  receive(): Promise<string>;
}

/**
 * Encrypted cross-app tunnel for sharing AI context between isolated Pi apps.
 */
export class PiCrossAppTunnel {
  private readonly key: CryptoKey;
  private readonly transport: CrossAppTransport;

  private constructor(key: CryptoKey, transport: CrossAppTransport) {
    this.key = key;
    this.transport = transport;
  }

  /**
   * Creates a tunnel using AES-GCM key material derived from shared secret.
   */
  public static async create(sharedSecret: string, transport: CrossAppTransport): Promise<PiCrossAppTunnel> {
    const encodedSecret = new TextEncoder().encode(sharedSecret.padEnd(32, '0').slice(0, 32));
    const key = await crypto.subtle.importKey('raw', encodedSecret, 'AES-GCM', false, ['encrypt', 'decrypt']);
    return new PiCrossAppTunnel(key, transport);
  }

  /**
   * Encrypts and sends a message payload.
   */
  public async send(message: CrossAppMessage): Promise<void> {
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(JSON.stringify(message));
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, this.key, encoded);

      await this.transport.send(
        JSON.stringify({
          iv: Array.from(iv),
          cipher: Array.from(new Uint8Array(encrypted))
        })
      );
    } catch (error: unknown) {
      throw new Error(
        `Failed to send encrypted message: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  }

  /**
   * Receives and decrypts a message payload.
   */
  public async receive(): Promise<CrossAppMessage> {
    try {
      const raw = await this.transport.receive();
      const parsed = JSON.parse(raw) as { iv: number[]; cipher: number[] };
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(parsed.iv) },
        this.key,
        new Uint8Array(parsed.cipher)
      );
      return JSON.parse(new TextDecoder().decode(decrypted)) as CrossAppMessage;
    } catch (error: unknown) {
      throw new Error(
        `Failed to receive encrypted message: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  }
}
