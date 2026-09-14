create table if not exists public.veiculos (id uuid default gen_random_uuid() primary key, created_at timestamp with time zone default timezone('utc'::text, now()) not null, updated_at timestamp with time zone default timezone('utc'::text, now()), titulo text not null, preco numeric not null, categoria text check (categoria in ('venda', 'aluguel')) not null default 'venda', descricao text, fotos text[] default '{}'::text[], status text check (status in ('disponivel', 'vendido')) not null default 'disponivel', views integer default 0);

alter table public.veiculos enable row level security;

drop policy if exists "Leitura publica" on public.veiculos;
create policy "Leitura publica" on public.veiculos for select using (true);

drop policy if exists "Escrita Admin" on public.veiculos;
create policy "Escrita Admin" on public.veiculos for all using (auth.role() = 'authenticated');

create index if not exists veiculos_status_idx on public.veiculos(status);

create index if not exists veiculos_categoria_idx on public.veiculos(categoria);
