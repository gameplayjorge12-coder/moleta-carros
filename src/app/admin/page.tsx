'use client';

import { useState, useEffect } from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import { AdminForm } from '@/components/AdminForm';
import { AdminList } from '@/components/AdminList';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Vehicle = Database['public']['Tables']['veiculos']['Row'];

/**
 * Painel Admin Mobile
 * - Login simples (password)
 * - Formulário rápido de cadastro
 * - Lista de carros com ações
 */
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);

  // Fonte da verdade = sessão no servidor (cookie httpOnly), não localStorage.
  // Evita o painel abrir com sessão expirada e todas as ações darem 401.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/me');
        const { authed } = await res.json();
        if (authed) {
          setIsAuthenticated(true);
          loadVehicles();
        } else {
          localStorage.removeItem('moleta-admin-authenticated');
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    })();
  }, []);

  // Carregar veículos
  const loadVehicles = async () => {
    setIsLoadingVehicles(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      console.error('Erro ao carregar veículos:', err);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Senha conferida no servidor; sessão vira cookie httpOnly
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        alert('❌ Senha incorreta');
        return;
      }
      localStorage.setItem('moleta-admin-authenticated', 'true');
      setIsAuthenticated(true);
      loadVehicles();
    } catch {
      alert('❌ Erro ao entrar. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      /* ignora */
    }
    localStorage.removeItem('moleta-admin-authenticated');
    setIsAuthenticated(false);
    setPassword('');
  };

  // Tela de Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-secondary mb-2">Moleta Admin</h1>
          <p className="text-neutral-600 mb-6">Painel de gerenciamento de veículos</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg input-focus"
                autoFocus
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Acessar Painel
            </button>
          </form>

          <p className="text-xs text-neutral-500 mt-6 text-center">
            Painel protegido. Acesso restrito ao administrador.
          </p>
        </div>
      </div>
    );
  }

  // Tela do Painel
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-secondary">Moleta Admin</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulário */}
          <div>
            <h2 className="text-2xl font-bold text-secondary mb-4">
              {editing ? 'Editar Veículo' : 'Cadastrar Veículo'}
            </h2>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <AdminForm
                onSuccess={loadVehicles}
                vehicle={editing}
                onCancelEdit={() => setEditing(null)}
              />
            </div>
          </div>

          {/* Lista de Carros */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-secondary">
                Estoque ({vehicles.length})
              </h2>
              <button
                onClick={loadVehicles}
                disabled={isLoadingVehicles}
                className="flex items-center gap-2 px-3 py-1 bg-neutral-200 hover:bg-neutral-300 rounded text-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingVehicles ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              {isLoadingVehicles ? (
                <div className="text-center py-8 text-neutral-500">
                  Carregando veículos...
                </div>
              ) : (
                <AdminList
                  vehicles={vehicles}
                  onUpdate={loadVehicles}
                  onEdit={(v) => {
                    setEditing(v);
                    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
