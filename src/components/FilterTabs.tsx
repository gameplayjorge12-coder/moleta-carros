'use client';

import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Tabs de filtro: Todos | Venda | Locadora
 * Query params: ?categoria=venda|aluguel
 */
export function FilterTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('categoria') || 'todos';

  const categories = [
    { value: 'todos', label: 'Todos' },
    { value: 'venda', label: '🚗 Venda' },
    { value: 'aluguel', label: '🔑 Locadora (4)' },
  ] as const;

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('categoria', category);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => handleCategoryChange(cat.value)}
          aria-selected={currentCategory === cat.value}
          className={`
            px-4 py-2 rounded-lg font-semibold whitespace-nowrap
            transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary
            ${
              currentCategory === cat.value
                ? 'bg-primary text-white shadow-lg-primary scale-100'
                : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
            }
          `}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
