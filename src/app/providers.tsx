'use client';

import { ReactNode } from 'react';

/**
 * Client Providers — contextos, loaders, etc
 * Wraps entire app
 */
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
