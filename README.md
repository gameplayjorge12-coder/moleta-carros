# 🚗 Moleta Carros — Vitrine + Admin

> Plataforma profissional de venda e aluguel de veículos. Site público + painel admin mobile.

## 🎯 Funcionalidades

### Vitrine Pública (`/`)
- ✅ Galeria de carros (Venda + Aluguel)
- ✅ Filtros por categoria
- ✅ Botão WhatsApp em cada carro
- ✅ Design responsivo mobile-first
- ✅ Otimização de imagens (WebP, lazy-load)
- ✅ Paleta de cores LARANJA (conversão)

### Painel Admin (`/admin`)
- ✅ Login simples
- ✅ Cadastro rápido de carros (mobile)
- ✅ Upload de fotos com compressão automática
- ✅ Lista de estoque com ações rápidas
- ✅ Marcar como vendido / Deletar

---

## 🚀 Quick Start

### 1. Clonar e instalar

```bash
git clone <repo>
cd moleta-carros
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com suas credenciais Supabase:

```bash
cp .env.example .env.local
```

**Variáveis obrigatórias:**
- `NEXT_PUBLIC_SUPABASE_URL` — URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Chave pública Supabase

### 3. Rodando localmente

```bash
npm run dev
```

Acesse: `http://localhost:3000`
Admin: `http://localhost:3000/admin`

### 4. Build para produção

```bash
npm run build
npm run start
```

---

## 🔧 Setup Supabase (Primeira Vez)

### 1. Criar tabela no Supabase

Vá para **SQL Editor** no console Supabase e execute:

```sql
-- Tabela de veículos
create table public.veiculos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  titulo text not null,
  preco numeric not null,
  categoria text check (categoria in ('venda', 'aluguel')) not null default 'venda',
  descricao text,
  fotos text[] default '{}'::text[],
  status text check (status in ('disponivel', 'vendido')) not null default 'disponivel',
  views integer default 0
);

-- Row Level Security
alter table public.veiculos enable row level security;

-- Policy: Leitura pública
create policy "Leitura publica" on public.veiculos
for select using (true);

-- Policy: Escrita (autenticado)
create policy "Escrita Admin" on public.veiculos
for all using (auth.role() = 'authenticated');

-- Índices
create index veiculos_status_idx on public.veiculos(status);
create index veiculos_categoria_idx on public.veiculos(categoria);
```

### 2. Criar bucket de storage

- Vá para **Storage** no console Supabase
- Clique **"New Bucket"**
- Nome: `veiculos`
- Deixar público
- Criar

### 3. Adicionar políticas de storage

Vá para o bucket `veiculos` → **Policies**:

```sql
-- Leitura pública
CREATE POLICY "Leitura publica" ON storage.objects FOR SELECT USING (bucket_id = 'veiculos');

-- Upload autenticado
CREATE POLICY "Upload autenticado" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'veiculos');

-- Delete autenticado
CREATE POLICY "Delete autenticado" ON storage.objects FOR DELETE USING (bucket_id = 'veiculos');
```

---

## 📱 Usando o Painel Admin

### Login
- Acesse: `/admin`
- Senha padrão: `admin123` (trocar em produção!)

### Cadastrar Carro
1. Preencha: Título, Preço, Tipo (Venda/Aluguel)
2. Adicione descrição (opcional)
3. Upload de fotos (até 10, comprimidas automaticamente)
4. Clique "Cadastrar Veículo"
5. ✅ Carro aparece na galeria em segundos!

### Gerenciar Estoque
- **Marcar como Vendido**: Oculta na galeria mas mantém histórico
- **Deletar**: Remove completamente

---

## 🎨 Design System

### Paleta Laranja (Conversão)
- **Primária**: `#FF6B35` (CTA, urgência)
- **Secundária**: `#1e40af` (headers, confiança)
- **Sucesso**: `#10b981` (disponível)
- **Perigo**: `#ef4444` (vendido)

### Animações
- Fade-in ao scroll (cards)
- Zoom ao hover (imagens)
- Scale ao hover (botões)
- Pulse em urgência (badges)

### Tipografia
- Headings: **Inter Bold** (títulos)
- Body: **Inter Regular** (textos)
- Preço: **24px Bold Laranja**

---

## 🔐 Segurança

### Em Desenvolvimento
- Senha simples (`admin123`) aceita para teste

### Em Produção
1. **Mudar senha admin**:
   ```bash
   NEXT_PUBLIC_ADMIN_PASSWORD="sua-senha-forte"
   ```

2. **Ativar Supabase Auth**:
   - Configurar OAuth (Google/GitHub) no Supabase
   - Substituir login simples por Supabase Auth
   - Ativar RLS (Row Level Security) completo

3. **HTTPS obrigatório**
   - Usar domínio com SSL/TLS
   - Supabase oferece isso automaticamente

---

## 📊 Performance

### Lighthouse Target
- **Mobile**: 90+
- **Desktop**: 95+

### Otimizações Implementadas
- ✅ Next.js Image optimization
- ✅ WebP + fallback
- ✅ Lazy loading
- ✅ CSS minificado
- ✅ Code splitting
- ✅ Compressão de imagens (200KB max)

### Verificar Performance

```bash
npm run build
npm run start

# Abrir em navegador e rodar Lighthouse
```

---

## 🧪 Testes

### Unit Tests
```bash
npm run test
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

---

## 🚢 Deploy no Vercel

### 1. Conectar repositório

- Acesse [vercel.com](https://vercel.com)
- Clique **"New Project"**
- Selecione repositório GitHub
- Clique **"Import"**

### 2. Configurar variáveis

Vá para **Settings** → **Environment Variables** e adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_ADMIN_PASSWORD=sua-senha-forte
```

### 3. Deploy

- Clique **"Deploy"**
- Aguarde ~2 minutos
- ✅ Site live!

---

## 🔗 Depois: Conectar Domínio

Quando Marcelo tiver domínio próprio:

1. Comprar domínio (ex: moleta-carros.com.br)
2. No Vercel: **Settings** → **Domains**
3. Adicionar domínio
4. Seguir instruções de DNS
5. ✅ Em ~5 min: `https://moleta-carros.com.br` pronto!

---

## 📞 Contato

- **WhatsApp**: [Falar com Marcelo](https://wa.me/5585987654321)
- **Local**: Uraí, PR

---

## 📝 Licença

Privado — Moleta Carros © 2026
