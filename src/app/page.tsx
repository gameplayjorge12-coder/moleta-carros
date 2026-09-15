import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { TrustBar } from '@/components/TrustBar';
import { SobreSection } from '@/components/SobreSection';
import { FilterTabs } from '@/components/FilterTabs';
import { CarGrid } from '@/components/CarGrid';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getWhatsAppSimpleLink } from '@/lib/whatsapp';

/**
 * Homepage — Vitrine cinematográfica
 * - Hero com veículo em destaque (RAV4)
 * - Vitrine com filtros + grid
 * Tudo leva pro WhatsApp (valor combinado direto com o Marcelo).
 */

// Sempre renderizar com estoque atual (admin adiciona carro -> aparece na hora)
export const dynamic = 'force-dynamic';

interface SearchParams {
  categoria?: string;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const categoria = searchParams.categoria || 'todos';

  let allCars: any[] = [];
  let loadError = false;

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('veiculos')
      .select('*')
      .eq('status', 'disponivel')
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Só veículos com foto no Storage + dedupe por título
    const seen = new Set<string>();
    allCars = (data || []).filter((v: any) => {
      const foto = v.fotos?.[0] || '';
      if (!foto.includes('/storage/v1/object/public/')) return false;
      if (seen.has(v.titulo)) return false;
      seen.add(v.titulo);
      return true;
    });
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    loadError = true;
  }

  // Veículo em destaque (RAV4) — estável independente do filtro
  const featured =
    allCars.find((v) => /rav4/i.test(v.titulo)) ||
    allCars.find((v) => v.categoria === 'venda') ||
    allCars[0] ||
    null;

  // Grid respeita o filtro de categoria — carro "ambos" aparece em venda E aluguel
  const vehicles =
    categoria === 'todos'
      ? allCars
      : allCars.filter(
          (v) => v.categoria === categoria || v.categoria === 'ambos'
        );

  return (
    <>
      <Header />

      <Hero featured={featured} />

      <TrustBar />

      {/* Vitrine */}
      <section id="vitrine" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-secondary">
                Nossa vitrine
              </h2>
              <p className="text-neutral-600 mt-1">
                {vehicles.length} veículo{vehicles.length === 1 ? '' : 's'}{' '}
                {categoria === 'venda'
                  ? 'à venda'
                  : categoria === 'aluguel'
                    ? 'para locação'
                    : 'disponíveis'}
              </p>
            </div>
            <FilterTabs />
          </div>

          {loadError ? (
            <div className="text-center py-12">
              <p className="text-neutral-600">Erro ao carregar veículos. Tente novamente.</p>
            </div>
          ) : (
            <CarGrid vehicles={vehicles} />
          )}
        </div>
      </section>

      <SobreSection />

      {/* CTA Rodapé */}
      <section className="bg-primary/10 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-secondary mb-4">
            Não achou o carro que procura?
          </h2>
          <p className="text-neutral-700 mb-6">
            Fale com Marcelo! Podemos ajudar você a encontrar exatamente o que você precisa.
          </p>
          <a
            href={getWhatsAppSimpleLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            💬 Enviar Mensagem
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm">
          <p>&copy; 2026 Moleta Carros. Todos os direitos reservados.</p>
          <p className="text-neutral-400 mt-2">Uraí, PR | WhatsApp: (43) 9978-4846</p>
          <p className="mt-5">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              <Lock className="w-4 h-4" /> Área do lojista (login)
            </Link>
          </p>
        </div>
      </footer>
    </>
  );
}
