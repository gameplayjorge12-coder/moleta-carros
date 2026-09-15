'use client';

import Image from 'next/image';
import { Trash2, CheckCircle2, Clock } from 'lucide-react';
import { priceLabel, formatDate } from '@/lib/formatters';
import { useState } from 'react';
import type { Database } from '@/types/database';

type Vehicle = Database['public']['Tables']['veiculos']['Row'];

interface AdminListProps {
  vehicles: Vehicle[];
  onUpdate?: () => void;
}

/**
 * Lista de carros cadastrados com ações rápidas
 * - Marcar como vendido
 * - Deletar
 */
export function AdminList({ vehicles, onUpdate }: AdminListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleMarkSold = async (vehicleId: string) => {
    setIsUpdating(vehicleId);

    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'vendido' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Falha ao atualizar');

      alert('✅ Marcado como vendido!');
      onUpdate?.();
    } catch (err) {
      alert(`❌ Erro: ${err instanceof Error ? err.message : 'Desconhecido'}`);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Tem certeza que quer deletar este veículo?')) return;

    setIsUpdating(vehicleId);

    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Falha ao deletar');

      alert('✅ Veículo deletado!');
      onUpdate?.();
    } catch (err) {
      alert(`❌ Erro: ${err instanceof Error ? err.message : 'Desconhecido'}`);
    } finally {
      setIsUpdating(null);
    }
  };

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        <p>Nenhum veículo cadastrado ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vehicles.map((vehicle) => (
        <div
          key={vehicle.id}
          className="bg-white border border-neutral-200 rounded-lg p-4 flex gap-3 items-start"
        >
          {/* Foto */}
          <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
            {vehicle.fotos?.[0] ? (
              <Image
                src={vehicle.fotos[0]}
                alt={vehicle.titulo}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                Sem foto
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate">{vehicle.titulo}</h3>
            <p className="text-primary font-bold text-sm">
              {priceLabel(vehicle.preco)}
            </p>
            <p className="text-xs text-neutral-500">
              {formatDate(vehicle.created_at)}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            {vehicle.status === 'vendido' ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-danger/10 text-danger rounded text-xs font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                Vendido
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded text-xs font-semibold">
                <Clock className="w-3 h-3" />
                Ativo
              </span>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-2 flex-shrink-0">
            {vehicle.status !== 'vendido' && (
              <button
                onClick={() => handleMarkSold(vehicle.id)}
                disabled={isUpdating === vehicle.id}
                className="text-xs px-2 py-1 bg-success text-white rounded hover:bg-success/90 disabled:opacity-50"
              >
                ✓ Vendido
              </button>
            )}

            <button
              onClick={() => handleDelete(vehicle.id)}
              disabled={isUpdating === vehicle.id}
              className="text-xs px-2 py-1 bg-danger text-white rounded hover:bg-danger/90 disabled:opacity-50 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Deletar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
