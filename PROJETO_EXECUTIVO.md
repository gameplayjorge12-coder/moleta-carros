# MOLETA CARROS — Projeto Executivo (Fase 1 MVP)

> **Status:** 🟢 AUTÔNOMO EM EXECUÇÃO
> **Data:** 2026-09-13
> **Versão:** 1.0 (Plano Melhorado + Gaps Resolvidos)

---

## 📋 VISÃO GERAL (Versão Melhorada)

### O Plano Original
- ✅ Stack: Next.js 14 + Supabase + Tailwind + Shadcn
- ✅ Fatiamento: 3 etapas (Início, Meio, Fim)
- ✅ Timeline: 1-3 dias

### Melhorias Adicionadas
- ✅ Design System com PALETA LARANJA (conversão)
- ✅ Animações fade-in/hover (psicologia visual)
- ✅ Testes estruturais + visuais por bloco
- ✅ Autenticação Supabase detalhada (setup)
- ✅ Error handling + tratamento de edge cases
- ✅ README completo pra Marcelo
- ✅ Acessibilidade (ARIA labels, mobile a11y)
- ✅ Checklist de deployment com validações

---

## 🏗️ ESTRUTURA DO PROJETO

```
moleta-carros/
├── .env.local (variáveis Supabase)
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── README.md (NOVO — instruções Marcelo)
├── DEPLOY_CHECKLIST.md (NOVO)
├── src/
│   ├── app/
│   │   ├── layout.tsx (root layout + design system)
│   │   ├── page.tsx (vitrine pública)
│   │   ├── admin/
│   │   │   ├── layout.tsx (auth middleware)
│   │   │   └── page.tsx (painel admin)
│   │   └── api/
│   │       └── auth/
│   │           └── callback/route.ts (Supabase OAuth)
│   ├── components/
│   │   ├── Header.tsx (logo + menu)
│   │   ├── FilterTabs.tsx (Venda/Aluguel)
│   │   ├── CarCard.tsx (card com foto + CTA)
│   │   ├── CarGrid.tsx (grid responsivo)
│   │   ├── WhatsAppButton.tsx (CTA flutuante)
│   │   ├── AdminForm.tsx (cadastro rápido)
│   │   ├── AdminList.tsx (lista de carros)
│   │   └── LoadingSkeletons.tsx (estado carregamento)
│   ├── lib/
│   │   ├── supabase.ts (cliente SSR)
│   │   ├── whatsapp.ts (gerador de links)
│   │   ├── imageCompression.ts (browser-image-compression)
│   │   ├── formatters.ts (BRL, datas, etc)
│   │   ├── validation.ts (zod schemas)
│   │   └── constants.ts (paleta, URLs)
│   ├── styles/
│   │   └── globals.css (design system CSS)
│   └── tests/
│       ├── components/CarCard.test.tsx
│       ├── lib/whatsapp.test.ts
│       ├── lib/imageCompression.test.ts
│       └── e2e/ (Playwright tests)
└── public/
    ├── logo.svg
    └── og-image.png

```

---

## 🎨 DESIGN SYSTEM (PALETA LARANJA)

### Cores
```typescript
const COLORS = {
  PRIMARY: '#FF6B35',     // Laranja (urgência + ação)
  PRIMARY_DARK: '#ff5a1f', // Hover state
  SECONDARY: '#1e40af',    // Azul (confiança)
  SUCCESS: '#10b981',      // Verde (disponível)
  DANGER: '#ef4444',       // Vermelho (vendido)
  GRAY_LIGHT: '#f3f4f6',   // Fundo cards
  GRAY_DARK: '#374151',    // Texto
};
```

### Animações
```css
/* Fade-in ao scroll */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hover botão CTA */
transition: all 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
:hover { transform: scale(1.05); box-shadow: 0 8px 24px rgba(...) }

/* Image zoom */
.image:hover img { transform: scale(1.08); }
```

### Tipografia
```
Headings: Inter, bold, #1e40af
Body: Inter, 400, #374151 (16px desktop / 14px mobile)
Preço: 24px, bold, #FF6B35
```

---

## 📦 STACK TÉCNICA DETALHADA

| Camada | Ferramenta | Versão | Por quê |
|--------|-----------|--------|---------|
| **Frontend** | Next.js | 14+ (App Router) | SSR, image optimization, deploy Vercel |
| **Styling** | Tailwind CSS | 3.3+ | mobile-first, utility-first, customização rápida |
| **UI** | Shadcn/UI | Latest | botões, cards, dialogs testados |
| **Ícones** | lucide-react | Latest | 1000+ ícones, SVG puro |
| **Forms** | react-hook-form | 7.x | performance, validação Zod |
| **Validação** | zod | 3.x | type-safe validation |
| **Database** | Supabase (PostgreSQL) | Latest | auth, storage, RLS integrado |
| **Image Compression** | browser-image-compression | 1.9+ | comprime 10MB→200KB no browser |
| **Auth** | Supabase Auth | Via SDK | OAuth, session management |
| **Testing** | Playwright + Vitest | Latest | e2e + unit tests |
| **Deployment** | Vercel | - | zero-config, serverless, CDN global |

---

## ⏱️ TIMELINE REALISTA

```
ETAPA 1 (INFRAESTRUTURA): 2h
  - Setup Next.js + Supabase + Tailwind ✓
  - Schema de banco (tabela veiculos) ✓
  - Middleware de autenticação ✓

ETAPA 2 (FRONTEND): 4h
  - Vitrine pública (CarCard, Grid, Filtros) ✓
  - WhatsApp link builder ✓
  - Animações + Design System ✓
  - Painel Admin (Formulário + Lista) ✓

ETAPA 3 (DEPLOY + VALIDAÇÃO): 3h
  - Performance optimization ✓
  - Testes + verificações visuais ✓
  - Deploy Vercel ✓
  - README + Documentação ✓

TOTAL: 9 horas (1 dia de trabalho contínuo)
```

---

## ✅ GAPS RESOLVIDOS

| Gap | Solução | Status |
|-----|---------|--------|
| Design System | Paleta LARANJA definida em `styles/globals.css` | ✅ |
| Animações | Fade-in, hover, zoom especificados | ✅ |
| Testes | Unit + E2E + visual checks | ✅ |
| Auth Supabase | Setup detalhado com middleware | ✅ |
| Error Handling | Try-catch, user feedback, logging | ✅ |
| Documentação | README para Marcelo + dev guide | ✅ |
| Acessibilidade | ARIA labels, mobile a11y | ✅ |
| Checklist Deploy | 20-point pre-launch validation | ✅ |

---

## 🚀 PRÓXIMAS AÇÕES (AUTÔNOMAS)

1. ✅ Criar estrutura de pastas completa
2. ✅ Gerar código de cada bloco (com testes)
3. ✅ Testar cada componente (visual + estrutural)
4. ✅ Verificar performance (Lighthouse 90+)
5. ✅ Documentação completa
6. ✅ Checklist de deployment
7. ✅ README para Marcelo

**Tempo estimado:** 4-6 horas contínuas de execução

---

**Status:** 🟢 PRONTO PARA COMEÇAR
**Próximo Step:** Criar estrutura + Etapa 1 (Infraestrutura)
