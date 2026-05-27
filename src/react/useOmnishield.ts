"use client";

import { useCallback } from 'react';
import type { EngineRequest, EngineResponse, EngineTelemetry } from '../types/omnishield';
import { useOmnishieldContext } from './OmnishieldProvider';

export interface UseOmnishieldResult {
  secureRequest: (request: EngineRequest) => Promise<EngineResponse>;
  emergencyStop: (reason?: string) => number;
  getTelemetry: () => EngineTelemetry;
}

/**
 * Hook exposing safe Omnishield engine methods to React components.
 */
export function useOmnishield(): UseOmnishieldResult {
  const { engine } = useOmnishieldContext();

  const secureRequest = useCallback(
    async (request: EngineRequest): Promise<EngineResponse> => {
      try {
        return await engine.secureRequest(request);
      } catch (error: unknown) {
        return {
          accepted: false,
          blockedReason: error instanceof Error ? error.message : 'Unknown secure request error.',
          telemetry: engine.getTelemetry()
        };
      }
    },
    [engine]
  );

  const emergencyStop = useCallback(
    (reason?: string): number => {
      try {
        return engine.emergencyStop(reason);
      } catch {
        return 0;
      }
    },
    [engine]
  );

  const getTelemetry = useCallback((): EngineTelemetry => engine.getTelemetry(), [engine]);

  return {
    secureRequest,
    emergencyStop,
    getTelemetry
  };
}
