export interface CorsShieldRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Readonly<Record<string, string>>;
  body?: string;
}

/**
 * Forwards model API calls through a secure edge proxy endpoint.
 */
export class PiCorsShield {
  private readonly proxyEndpoint: string;

  public constructor(proxyEndpoint: string) {
    this.proxyEndpoint = proxyEndpoint;
  }

  /**
   * Sends target request via proxy to avoid direct mobile-webview CORS failures.
   */
  public async forward(request: CorsShieldRequest): Promise<Response> {
    try {
      return await fetch(this.proxyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetUrl: request.url,
          method: request.method ?? 'POST',
          headers: request.headers ?? {},
          body: request.body ?? null
        })
      });
    } catch (error: unknown) {
      throw new Error(
        `PiCorsShield forward failed: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  }
}
