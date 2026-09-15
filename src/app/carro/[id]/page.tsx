import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, MessageCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { CarGallery } from '@/components/CarGallery';
import { createServerSupabaseClient } from '@/lib/supabase';
import { formatCurrency } from '@/lib/formatters';
import { getWhatsAppLink } from '@/lib/whatsapp';
import type { Database } from '@/types/database';

type Vehicle = Database['public']['Tables']['veiculos']['Row'];

export const dynamic = 'force-dynamic';

export default async function CarroPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('veiculos')
    .select('*')
    .eq('id', params.id)
    .single();

  const v = data as Vehicle | null;
  if (!v) notFound();

  const fotos = v.fotos ?? [];
  const wpp = getWhatsAppLink(v.titulo, v.categoria, v.preco);
  const catLabel = v.categoria === 'venda' ? '🚗 Venda' : '🔑 Locadora';

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para a vitrine
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            {fotos.length ? (
              <CarGallery fotos={fotos} alt={v.titulo} />
            ) : (
              <div className="aspect-[4/3] bg-neutral-200 rounded-xl flex items-center justify-center text-neutral-400">
                Sem imagem
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <span className="inline-block w-fit bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-bold">
              {catLabel}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-secondary">{v.titulo}</h1>

            <div className="text-3xl font-bold text-primary">
              {v.preco > 0 ? formatCurrency(v.preco) : <span className="text-2xl">Consultar valor</span>}
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <MapPin className="w-4 h-4" /> Uraí, PR
            </div>

            {v.descricao && (
              <p className="text-neutral-700 leading-relaxed">{v.descricao}</p>
            )}

            <a
              href={wpp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center justify-center gap-2 text-base py-4 mt-2"
            >
              <MessageCircle className="w-5 h-5" /> Falar com Marcelo no WhatsApp
            </a>
            <p className="text-xs text-neutral-500 text-center">
              Valores, quilometragem e condições combinados diretamente no WhatsApp.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-neutral-900 text-white py-8 px-4 mt-10 text-center text-sm">
        <p>&copy; 2026 Moleta Carros — Uraí, PR</p>
      </footer>
    </>
  );
}
