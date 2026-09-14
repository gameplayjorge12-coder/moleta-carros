import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { FilterTabs } from '@/components/FilterTabs';
import { CarGrid } from '@/components/CarGrid';
import { createServerSupabaseClient } from '@/lib/supabase';

/**
 * Homepage Pública — Vitrine de Carros
 *
 * Mobile-first:
 * - Header sticky com WhatsApp CTA
 * - Filtros Venda/Aluguel
 * - Grid de carros (fade-in ao scroll)
 * - Cada card tem foto + preço LARANJA + CTA WhatsApp
 */

export const revalidate = 3600; // Revalidar a cada 1h

async function VehicleList({ categoria }: { categoria: string }) {
  const supabase = createServerSupabaseClient();

  try {
    let query = supabase
      .from('veiculos')
      .select('*')
      .eq('status', 'disponivel')
      .order('created_at', { ascending: false });

    if (categoria && categoria !== 'todos') {
      query = query.eq('categoria', categoria);
    }

    const { data: vehicles, error } = await query;

    if (error) throw error;

    return <CarGrid vehicles={vehicles || []} />;
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Erro ao carregar veículos. Tente novamente.</p>
      </div>
    );
  }
}

interface SearchParams {
  categoria?: string;
}

export default function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const categoria = searchParams.categoria || 'todos';

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
            <Suspense fallback={<div className="h-12 bg-neutral-200 rounded-lg animate-pulse" />}>
              <FilterTabs />
            </Suspense>
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

          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-neutral-200 rounded-lg h-96 animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <VehicleList categoria={categoria} />
          </Suspense>
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
            href="https://wa.me/5585987654321"
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
          <p className="text-neutral-400 mt-2">Uraí, PR | Telefone: (85) 98765-4321</p>
        </div>
      </footer>
    </>
  );
}
