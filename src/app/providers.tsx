'use client';

import { ReactNode } from 'react';
import { MeshTracker } from '@/components/MeshTracker';

/**
 * Client Providers — contextos, loaders, etc
 * Wraps entire app
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <MeshTracker />
      {children}
    </>
  );
}
