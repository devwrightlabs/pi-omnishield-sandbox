/**
 * Chunks large model output so constrained mobile webviews remain responsive.
 */
export class PiMemorySafeSandbox {
  private readonly maxChunkSize: number;

  public constructor(maxChunkSize = 1024) {
    this.maxChunkSize = Math.max(128, maxChunkSize);
  }

  /**
   * Streams text safely in small chunks and yields to the event loop per chunk.
   */
  public async streamInChunks(
    input: string,
    onChunk: (chunk: string) => void
  ): Promise<{ chunks: number; totalBytes: number }> {
    try {
      let offset = 0;
      let chunks = 0;
      const totalBytes = new TextEncoder().encode(input).byteLength;

      while (offset < input.length) {
        const chunk = input.slice(offset, offset + this.maxChunkSize);
        onChunk(chunk);
        chunks += 1;
        offset += this.maxChunkSize;
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }

      return { chunks, totalBytes };
    } catch {
      return { chunks: 0, totalBytes: 0 };
    }
  }

  /**
   * Requests runtime garbage collection if supported by host environment.
   */
  public requestGarbageCollection(): void {
    try {
      const maybeGlobal = globalThis as { gc?: () => void };
      if (typeof maybeGlobal.gc === 'function') {
        maybeGlobal.gc();
      }
    } catch {
      // No-op for unsupported hosts.
    }
  }
}
