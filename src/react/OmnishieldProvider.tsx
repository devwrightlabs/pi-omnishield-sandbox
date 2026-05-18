"use client";

import React, { createContext, useContext, useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import type { EngineConfiguration } from '../types/omnishield';
import { OmnishieldEngine } from '../core/OmnishieldEngine';

export interface OmnishieldContextValue {
  engine: OmnishieldEngine;
}

const OmnishieldContext = createContext<OmnishieldContextValue | null>(null);

/**
 * React provider that initializes OmnishieldEngine and secures app-level AI boundaries.
 */
export function OmnishieldProvider({
  children,
  config
}: PropsWithChildren<{ config?: EngineConfiguration }>): JSX.Element {
  const engine = useMemo(() => {
    try {
      return new OmnishieldEngine(config);
    } catch {
      return new OmnishieldEngine({
        ...config,
        scope: 'READ_ONLY'
      });
    }
  }, [config]);

  return <OmnishieldContext.Provider value={{ engine }}>{children}</OmnishieldContext.Provider>;
}

/**
 * Gets Omnishield context value.
 */
export function useOmnishieldContext(): OmnishieldContextValue {
  const context = useContext(OmnishieldContext);
  if (!context) {
    throw new Error('useOmnishieldContext must be used inside OmnishieldProvider.');
  }
  return context;
}
