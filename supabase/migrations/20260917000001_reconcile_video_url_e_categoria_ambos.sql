-- Reconcilia o schema do repo com a PRODUÇÃO (drift detectado em 2026-09-17).
-- A tabela viva já tem estas mudanças; aqui elas viram idempotentes para que uma
-- reconstrução do zero (disaster recovery / novo ambiente) gere o schema CORRETO.
-- Sem isto, rebuild pela migration original rejeitaria 'ambos' e não teria video_url,
-- quebrando o cadastro (categoria "Venda e Aluguel") e todo INSERT com vídeo.

-- 1. Coluna de vídeo opcional (a API insere/atualiza video_url; original não a criava)
alter table public.veiculos add column if not exists video_url text;

-- 2. categoria aceita 'ambos' (o AdminForm oferece "Venda e Aluguel")
alter table public.veiculos drop constraint if exists veiculos_categoria_check;
alter table public.veiculos
  add constraint veiculos_categoria_check
  check (categoria in ('venda', 'aluguel', 'ambos'));
