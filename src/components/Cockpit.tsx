'use client';

import { useEffect, useState } from 'react';
import {
  Trophy, AlertTriangle, Target, Flame, Users, Eye, MessageCircle,
  Wallet, RefreshCw, Moon, Repeat, ChevronRight,
} from 'lucide-react';
import type { Insights, Nivel } from '@/lib/insights';
import { formatCurrency } from '@/lib/formatters';

// Copiloto Moleta — o cockpit que o Marcelo abre. Lê /api/admin/insights e
// mostra em linguagem de dono de loja: o dia, o semáforo, o termômetro, os leads.
function saudacao(): string {
  const h = new Date().getHours(); // horário local do Marcelo (browser) — ok no cliente
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function hojeExtenso(): string {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function desde(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'agora mesmo';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

const dot: Record<Nivel, string> = {
  verde: 'bg-emerald-500',
  amarelo: 'bg-amber-500',
  vermelho: 'bg-red-500',
};
const borda: Record<Nivel, string> = {
  verde: 'border-l-emerald-500 bg-emerald-50',
  amarelo: 'border-l-amber-500 bg-amber-50',
  vermelho: 'border-l-red-500 bg-red-50',
};

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
      <Icon className="w-4 h-4 text-white/60 mb-1" />
      <div className="text-2xl font-bold leading-none">{value}</div>
      <div className="text-[11px] text-white/60 mt-1">{label}</div>
    </div>
  );
}

export function Cockpit() {
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  const carregar = async () => {
    setLoading(true);
    setErro(false);
    try {
      const res = await fetch('/api/admin/insights', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setErro(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-secondary to-neutral-900 text-white p-6 animate-pulse">
        <div className="h-6 w-40 bg-white/20 rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 bg-white/10 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (erro || !data) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 flex items-center justify-between">
        <p className="text-neutral-600 text-sm">Não consegui carregar o resumo agora.</p>
        <button onClick={carregar} className="flex items-center gap-2 text-primary font-semibold text-sm">
          <RefreshCw className="w-4 h-4" /> Tentar de novo
        </button>
      </div>
    );
  }

  const { hoje, briefing, alertas, carros, leadsQuentes, provaDeValor, foraDoExpedienteAgora } = data;
  const carrosComMovimento = carros.filter((c) => c.views7d > 0 || c.contatos7d > 0);

  return (
    <div className="space-y-6">
      {/* HERO — Bom dia + números do dia */}
      <div className="rounded-2xl bg-gradient-to-br from-secondary to-neutral-900 text-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {saudacao()}, Marcelo
              {foraDoExpedienteAgora && <Moon className="w-5 h-5 text-white/50" />}
            </h2>
            <p className="text-white/60 text-sm capitalize">{hojeExtenso()}</p>
          </div>
          <button
            onClick={carregar}
            title="Atualizar"
            className="text-white/60 hover:text-white transition-colors shrink-0"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-white/80">{provaDeValor}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <Kpi icon={Users} label="visitantes hoje" value={String(hoje.visitantes)} />
          <Kpi icon={Eye} label="carros vistos" value={String(hoje.carrosVistos)} />
          <Kpi icon={MessageCircle} label="contatos hoje" value={String(hoje.contatos)} />
          <Kpi icon={Wallet} label="em vitrine hoje" value={formatCurrency(hoje.valorVitrine)} />
        </div>
      </div>

      {/* BRIEFING — 1 vitória, 1 atenção, 1 ação */}
      <div className="grid sm:grid-cols-3 gap-3">
        {briefing.vitoria && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1">
              <Trophy className="w-4 h-4" /> Vitória
            </div>
            <p className="text-sm text-neutral-700">{briefing.vitoria}</p>
          </div>
        )}
        {briefing.atencao && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-1">
              <AlertTriangle className="w-4 h-4" /> Atenção
            </div>
            <p className="text-sm text-neutral-700">{briefing.atencao}</p>
          </div>
        )}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
            <Target className="w-4 h-4" /> Ação de hoje
          </div>
          <p className="text-sm text-neutral-700">{briefing.acao}</p>
        </div>
      </div>

      {/* LEADS QUENTES */}
      {leadsQuentes.length > 0 && (
        <div>
          <h3 className="font-bold text-secondary mb-2 flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" /> Quem chamou no WhatsApp
          </h3>
          <div className="space-y-2">
            {leadsQuentes.map((l, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg border border-neutral-200 px-4 py-3">
                <span className="text-sm font-medium text-neutral-800">
                  {l.titulo ?? 'Alguém'} <span className="text-neutral-400">— interesse</span>
                </span>
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  {l.foraDoExpediente && <Moon className="w-3 h-3" />} {desde(l.quandoISO)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALERTAS — semáforo */}
      {alertas.length > 0 && (
        <div>
          <h3 className="font-bold text-secondary mb-2">O que o copiloto notou</h3>
          <div className="space-y-2">
            {alertas.map((a, i) => (
              <div key={i} className={`rounded-lg border-l-4 ${borda[a.nivel]} px-4 py-3`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${dot[a.nivel]}`} />
                  <span className="font-semibold text-sm text-neutral-800">{a.titulo}</span>
                  {a.valor ? (
                    <span className="ml-auto text-xs font-bold text-neutral-500">{formatCurrency(a.valor)}</span>
                  ) : null}
                </div>
                <p className="text-sm text-neutral-600 mt-1 pl-4">{a.detalhe}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TERMÔMETRO DE DESEJO */}
      {carrosComMovimento.length > 0 && (
        <div>
          <h3 className="font-bold text-secondary mb-2">Termômetro de desejo (7 dias)</h3>
          <div className="space-y-2">
            {carrosComMovimento.slice(0, 8).map((c) => (
              <div key={c.id} className="bg-white rounded-lg border border-neutral-200 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-neutral-800 truncate">{c.titulo}</span>
                  <span className="text-xs text-neutral-500 shrink-0 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{c.views7d}</span>
                    {c.retornos > 0 && (
                      <span className="flex items-center gap-1 text-emerald-600" title="pessoas que voltaram">
                        <Repeat className="w-3 h-3" />{c.retornos}
                      </span>
                    )}
                    {c.contatos7d > 0 && (
                      <span className="flex items-center gap-1 text-primary">
                        <MessageCircle className="w-3 h-3" />{c.contatos7d}
                      </span>
                    )}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500"
                    style={{ width: `${Math.max(4, c.score)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-neutral-200 pt-4 flex items-center gap-1 text-xs text-neutral-400">
        <ChevronRight className="w-3 h-3" /> Abaixo você cadastra e edita os carros.
      </div>
    </div>
  );
}
