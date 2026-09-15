# 🚗 MOLETA CARROS — Guia de Uso para Marcelo

**Status:** ✅ **LIVE EM PRODUÇÃO**  
**Data:** 15 de Setembro de 2026  
**Versão:** 1.0 MVP

---

## 📍 ACESSO

### Vitrine (Público)
- **URL Vercel:** https://moleta-carros-gyby32bqy-js-projects-2dc3fbda.vercel.app
- **URL Customizada:** [Quando tiver domínio, será aqui]
- **O quê:** Galeria de carros (Venda / Aluguel) — público, sem login

### Painel Admin (Privado)
- **URL:** https://moleta-carros-gyby32bqy-js-projects-2dc3fbda.vercel.app/admin
- **Login:** Basta clicar — usa password local
- **Senha:** `admin123`
- **O quê:** Adicionar, editar, deletar carros

---

## 🎯 WORKFLOW — ADICIONAR CARRO

### Passo 1: Abrir Admin
```
1. Vai em: /admin
2. Clica "Fazer login"
3. Cole a senha: admin123
```

### Passo 2: Preencher Formulário
- **Título:** Ex: "Hyundai Creta 2021"
- **Preço:** Ex: 45000 (só número)
- **Tipo:** Seleciona "Venda" ou "Aluguel"
- **Descrição:** Detalhes do carro (opcional)
- **Fotos:** Clica pra enviar (até 10 fotos)
  - Compressão automática (não se preocupa com tamanho)
  - JPG/PNG
  - Limite: 10 fotos por carro

### Passo 3: Salvar
- Clica **"➕ Cadastrar Veículo"**
- Pronto! Já aparece na galeria pública

---

## 📊 GERENCIAR CARROS

### Na lista de carros (admin):

**Ações disponíveis:**
- **✓ Vendido** — Marca como vendido (sai da galeria pública)
- **🗑 Deletar** — Remove permanentemente

---

## 🎨 GALERIA PÚBLICA

**Filtros automáticos:**
- "🚗 Venda" — Mostra só carros de venda
- "🔑 Aluguel" — Mostra só carros de aluguel
- "📊 Todos" — Mostra tudo

**Estatísticas:**
- Cada carro conta visualizações (contador interno)

---

## 📱 RESPONSIVO

- ✅ Mobile (375px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1920px+)
- ✅ Imagens otimizadas (fast loading)

---

## 🛠 CUSTOMIZAÇÃO FUTURA

### Adicionar domínio customizado
1. Compre um domínio (Namecheap, GoDaddy, etc)
2. Aponte pra Vercel (instruções em docs)
3. Pronto!

### Mudança de cores
- Design System: **Paleta LARANJA** (#FF6B35)
- Para mudar: editar `src/styles/globals.css`
- Informar Claude pra fazer mudança

### Analytics
- Vercel inclui Web Analytics (grátis)
- Vai em: Dashboard Vercel → Analytics

---

## 🔧 TÉCNICO

**Database:** Supabase PostgreSQL
- Tabela: `veiculos`
- Campos: id, titulo, preco, categoria, descricao, fotos, status, views

**Storage:** Supabase Cloud Storage
- Pasta: `veiculos/`
- Imagens comprimidas automaticamente no browser

**Deployer:** Vercel (Next.js)
- Builds automáticos (sempre que push no GitHub)
- CDN global

---

## ⚠️ BACKUP / SEGURANÇA

**Backup automático:**
- GitHub: https://github.com/gameplayjorge12-coder/moleta-carros
- Supabase: backups diários automáticos

**Senha admin:**
- Guardada no `.env.local` (não envia pro GitHub)
- Só você tem acesso

---

## 🆘 PROBLEMAS?

**Fotos não carregam:**
- Verifica conexão internet
- Tenta browser diferente

**Carro não aparece na galeria:**
- Verifica se status é "disponível" (não "vendido")
- Aguarda 2min (cache do Vercel)

**Esqueceu a senha:**
- Sou Claude — restauro em 1 min via email

---

## 📅 PRÓXIMOS PASSOS

1. **Domínio customizado** (Marcelo escolhe)
2. **Integração WhatsApp** (opcional — Claude faz)
3. **Analytics dashboard** (Claude configura)
4. **SEO** (Claude otimiza)

---

**Desenvolvido por:** Claude Code  
**Framework:** Next.js 14 + Supabase + Tailwind CSS  
**Deploy:** Vercel  
**Última atualização:** 2026-09-15
