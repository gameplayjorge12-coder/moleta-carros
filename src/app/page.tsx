import Link from 'next/link';
import { Header } from '@/components/Header';
import { FilterTabs } from '@/components/FilterTabs';
import { CarGrid } from '@/components/CarGrid';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getWhatsAppSimpleLink } from '@/lib/whatsapp';

/**
 * Homepage Pública — Vitrine de Carros
 *
 * Mobile-first:
 * - Header sticky com WhatsApp CTA
 * - Filtros Venda/Aluguel
 * - Grid de carros (fade-in ao scroll)
 * - Cada card tem foto + preço LARANJA + CTA WhatsApp
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

  let vehicles: any[] = [];
  let loadError = false;

  try {
    const supabase = createServerSupabaseClient();
    let query = supabase
      .from('veiculos')
      .select('*')
      .eq('status', 'disponivel')
      .order('created_at', { ascending: false });

    if (categoria && categoria !== 'todos') {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;
    if (error) throw error;
    // Só veículos com imagem no Supabase Storage (filtra seeds antigos de teste)
    // + dedupe por título (evita duplicatas de inserts repetidos)
    const seen = new Set<string>();
    vehicles = (data || []).filter((v: any) => {
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

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-secondary/10 to-transparent py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary mb-4">
              Encontre seu próximo carro
            </h1>
            <p className="text-lg sm:text-xl text-neutral-700 max-w-2xl">
              Venda e aluguel de veículos de qualidade em Uraí, PR. Seleção rigorosa e atendimento profissional.
            </p>
          </div>

          {/* Filtros */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-neutral-600 mb-3">Filtrar por:</h2>
            <FilterTabs />
          </div>
        </div>
      </section>

      {/* Galeria de Carros */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-secondary mb-8">
            {categoria === 'todos'
              ? 'Todos os Veículos'
              : categoria === 'venda'
                ? 'Carros à Venda'
                : 'Carros para Aluguel'}
          </h2>

          {loadError ? (
            <div className="text-center py-12">
              <p className="text-neutral-600">Erro ao carregar veículos. Tente novamente.</p>
            </div>
          ) : (
            <CarGrid vehicles={vehicles} />
          )}
        </div>
      </section>

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
          <p className="mt-4">
            <Link
              href="/admin"
              className="text-neutral-500 hover:text-primary text-xs underline underline-offset-4 transition-colors"
            >
              Painel do administrador
            </Link>
          </p>
        </div>
      </footer>
    </>
  );
}
