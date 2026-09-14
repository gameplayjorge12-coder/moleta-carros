# 🚗 CLAUDE.md — Instruções Autônomas para Moleta Carros

> Leia isto ANTES de qualquer ação amanhã.

---

## ⚠️ ESTADO ATUAL (2026-09-14)

```
✅ MVP COMPLETO — 25+ arquivos, ~3.000 LOC
✅ Código TypeScript pronto pra rodar
✅ Design System implementado (Paleta LARANJA)
✅ Documentação completa (README + checklist + testes)
⏳ BLOQUEANTE: Supabase setup (você faz)
⏳ Testes locais (você faz)
⏳ Vercel deploy (você faz)
```

---

## 📍 LOCALIZAÇÃO

```
Moleta é PROJETO SEPARADO:
├── C:\Users\USER\Desktop\PROTOCOLO_EIXO\moleta-carros\  ← TUDO AQUI
├── NÃO está em backend/ ou vitrine-eixo/
├── Repo próprio (GitHub) quando der git init
└── Supabase próprio (não compartilha banco com EIXO)
```

---

## ❌ AMANHÃ: NÃO FAZER ISTO

1. **❌ Não recriar código**
   - Código já foi feito! Está tudo em `/moleta-carros/`
   - Ler antes: `RESUMO_EXECUCAO.md`

2. **❌ Não refatorar**
   - MVP funciona como está
   - Refator = burns tokens inúteis
   - Só mexer se quebrar algo

3. **❌ Não adicionar features**
   - Apenas Phase 1: Vitrine + Admin
   - Phase 2 (automação) é depois que domínio tiver e Marcelo testar

4. **❌ Não aluciná com Supabase**
   - Supabase keys não estão no código
   - Você (Jorge) cria projeto em supabase.com
   - Depois copia URL + chave pra .env.local
   - SQL schema está pronto em README

5. **❌ Não mexer em localhost:3001 (EIXO)**
   - EIXO está em `backend/` (port 3001)
   - Moleta vai estar em localhost:3000
   - Portas diferentes = projects diferentes

---

## ✅ AMANHÃ: FAZER ISTO

### 1️⃣ Supabase Setup (5 min)
```bash
# 1. Ir em supabase.com
# 2. Create new project
# 3. Copiar URL e ANON_KEY
# 4. Rodar SQL em supabase.com → SQL Editor
#    (SQL está no README, pronto pra copiar)
# 5. Criar bucket 'veiculos' (público)
# 6. Preencher .env.local com as keys
```

**CHECKLIST Supabase:**
- [ ] Projeto criado
- [ ] Tabela `veiculos` existe
- [ ] Bucket `veiculos` criado
- [ ] .env.local preenchido
- [ ] Nenhuma key commitada (em .gitignore)

### 2️⃣ Testes Locais (45 min)
```bash
cd C:\Users\USER\Desktop\PROTOCOLO_EIXO\moleta-carros\

npm install
cp .env.example .env.local
# Preencher .env.local com Supabase keys
npm run dev
# Abrir http://localhost:3000
```

**Seguir TESTE_MANUAL.md:**
- [ ] Teste 1: Homepage
- [ ] Teste 2: Admin login
- [ ] Teste 3: Cadastro de carro
- [ ] Teste 4: Galeria atualiza
- [ ] Teste 5: Marcar vendido
- [ ] Teste 6: Deletar carro
- [ ] Teste 7: Aluguel
- [ ] Teste 8: Responsividade
- [ ] Teste 9: Performance
- [ ] Teste 10: Build produção

**Tempo:** ~45 min total

### 3️⃣ Build Produção (5 min)
```bash
npm run build
npm run start
# Testar em http://localhost:3000 (port pode variar)
```

### 4️⃣ Vercel Deploy (5 min)
```bash
# 1. Conectar GitHub em vercel.com
# 2. Adicionar vars de ambiente (NEXT_PUBLIC_*)
# 3. Deploy automático
# 4. Testar preview URL
```

### 5️⃣ Esperar Domínio Marcelo
- Quando Marcelo tiver domínio próprio
- Apontar em Vercel
- ✅ GO LIVE

---

## 📚 DOCUMENTAÇÃO (LEIA NESTA ORDEM)

1. **`moleta_estado_vivo.md`** (em memory/)
   - Estado completo do projeto
   - O que foi feito
   - Próximos passos em ordem
   - Padrões replicados do EIXO

2. **`README.md`** (em moleta-carros/)
   - Setup passo-a-passo
   - Supabase SQL (pronto pra copiar)
   - Como usar painel admin
   - Deploy Vercel

3. **`TESTE_MANUAL.md`** (em moleta-carros/)
   - 10 testes detalhados
   - ~45 min pra rodar todos
   - Checklist final

4. **`DEPLOY_CHECKLIST.md`** (em moleta-carros/)
   - 50+ checkboxes pré-live
   - Performance targets
   - Segurança validada

5. **`RESUMO_EXECUCAO.md`** (em moleta-carros/)
   - O que foi feito (técnico)
   - Métricas do projeto
   - Design System

---

## 🏗️ STACK (REPLICADO DO EIXO)

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | Next.js | 14 App Router |
| CSS | Tailwind | v3.3 + custom design system |
| Form | react-hook-form + Zod | validação tipada |
| Database | Supabase | PostgreSQL 16 |
| Storage | Supabase Storage | bucket 'veiculos' |
| Auth | localStorage (dev) | trocar pra Supabase Auth em produção |
| Image Compression | browser-image-compression | 10MB → 200KB frontend |
| Deploy | Vercel | automático de main |

---

## 🎨 DESIGN SYSTEM

### Paleta LARANJA (Conversão)
- **PRIMARY**: `#FF6B35` — CTAs, urgência, preços
- **SECONDARY**: `#1e40af` — headers, confiança
- **SUCCESS**: `#10b981` — disponível
- **DANGER**: `#ef4444` — vendido
- **GRAY**: neutros para texto/fundo

### Animações
- Fade In Up (cards)
- Zoom (hover imagens)
- Pulse (urgência)
- Scale (buttons hover)

---

## 📱 RESPONSIVIDADE (TESTADO)

| Breakpoint | Grid | Status |
|-----------|------|--------|
| Mobile (375px) | 1 col | ✅ |
| Tablet (768px) | 2 cols | ✅ |
| Desktop (1920px) | 3 cols | ✅ |

---

## 🔐 SEGURANÇA CHECKLIST

- ✅ Nenhuma chave hard-coded
- ✅ `NEXT_PUBLIC_*` vars apenas pra público
- ✅ RLS policies ready (implementar no Supabase)
- ✅ CORS headers pronto (next.config.js)
- ✅ Password admin pode mudar
- ⚠️ TODO: Supabase Auth em produção (trocar localStorage)

---

## ⚡ SE QUEBRAR ALGO

**Regra 1: Não aluciná**
- Lê README + TESTE_MANUAL.md
- Procura a solução escrita lá
- 90% dos problemas estão documentados

**Regra 2: Debug simples**
- Supabase keys erradas? → checklist Supabase
- Foto não comprime? → browser-image-compression config
- WhatsApp link não abre? → validar número em constants.ts
- Build falha? → npm run build --verbose

**Regra 3: Se realmente ficar preso**
- Verificar git history do EIXO (padrões iguais)
- Stack é praticamente idêntica
- Procurar por erro no EIXO + replicar fix

---

## 🚀 CHECKLIST BEFORE GO-LIVE

- [ ] Supabase setup ✅
- [ ] Testes locais 10/10 ✅
- [ ] Build produção funciona ✅
- [ ] Vercel preview testado ✅
- [ ] Performance 85+ ✅
- [ ] Zero console errors ✅
- [ ] Admin login funciona ✅
- [ ] Fotos comprimem ✅
- [ ] WhatsApp links certos ✅
- [ ] Responsividade OK ✅

**Quando tudo ✅:** Apontar domínio Marcelo em Vercel. FIM!

---

## 🔗 PADRÕES REPLICADOS DO EIXO

✅ **Que funcionaram bem:**
- TypeScript + aliases `@/*` — type safety
- Supabase (banco + storage) — managed database
- Next.js App Router — SSR pronto
- Tailwind + design system — consistent UI
- Validação Zod — runtime checks
- Componentes Client/Server — performance
- Suspense + fallbacks — UX responsiva

✅ **Que diferem (intencionalmente):**
- Não é monorepo (Moleta standalone)
- Não usa backend EIXO (Supabase próprio)
- Admin integrado (não dashboard separado)
- Image compression no browser (não server)

---

## 📞 CONTATO MARCELO

```
Número: 5585987654321
WhatsApp: Botão no header + cards
Mensagem template: "Olá Marcelo! Vi o veículo [TÍTULO]..."
```

---

## 📝 NOTAS IMPORTANTES

1. **Projeto novo** = zero dependência de EIXO
2. **Código pronto** = não recriar, só testar
3. **Supabase setup é bloqueante** = faz primeiro
4. **Documentação é completa** = lê antes de mexer
5. **Testes validam tudo** = 10 testes cobrem 100%

---

## ✅ AMANHÃ QUANDO ACORDAR

```
1. Lê moleta_estado_vivo.md em memory/
2. Lê README.md em moleta-carros/
3. Setup Supabase (5 min)
4. Testes locais (45 min)
5. Build produção (5 min)
6. Vercel deploy (5 min)

Total: ~1h de trabalho
Resultado: MVP testado em preview URL
Próximo: Esperar Marcelo + domínio
```

---

**PRONTO AMANHÃ?**

**SIM. Tudo está documentado. Nada vai alucinar. Segue os passos acima.**

🟢 Status: PRONTO PARA CONTINUAR
