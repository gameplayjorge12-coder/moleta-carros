'use client';

import { CarCard } from './CarCard';
import type { Database } from '@/types/database';

type Vehicle = Database['public']['Tables']['veiculos']['Row'];

interface CarGridProps {
  vehicles: Vehicle[];
  loading?: boolean;
}

/**
 * Grid responsivo de carros
 * - Mobile: 1 coluna
 * - Tablet: 2 colunas
 * - Desktop: 3 colunas
 */
export function CarGrid({ vehicles, loading = false }: CarGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-neutral-200 rounded-lg h-80 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-20">
        <p className="text-neutral-600 text-lg">Nenhum veículo encontrado</p>
        <p className="text-neutral-500 text-sm mt-2">Volte em breve! Temos carros novos frequentemente</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {vehicles.map((vehicle, idx) => (
        <CarCard key={vehicle.id} vehicle={vehicle} index={idx} />
      ))}
    </div>
  );
}
