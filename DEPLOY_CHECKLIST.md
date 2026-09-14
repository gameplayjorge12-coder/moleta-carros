# 🚀 Deploy Checklist — Moleta Carros

> **Antes de conectar no domínio dele**, marque TUDO aqui.

---

## ✅ PRÉ-DESENVOLVIMENTO

- [ ] **Supabase projeto criado**
  - [ ] Tabela `veiculos` com schema completo
  - [ ] Bucket `veiculos` criado (público)
  - [ ] Policies de RLS configuradas
  - [ ] SQL testado no Supabase SQL Editor

- [ ] **Variáveis de ambiente**
  - [ ] `.env.local` preenchido com Supabase keys
  - [ ] `NEXT_PUBLIC_ADMIN_PASSWORD` setado
  - [ ] Nenhuma chave sensível no git

---

## ✅ DESENVOLVIMENTO

- [ ] **Código completo**
  - [ ] Layout criado (Header, Filtros, CarCard, CarGrid)
  - [ ] Homepage `/` renderiza corretamente
  - [ ] Painel admin `/admin` com login + formulário
  - [ ] WhatsApp links funcionando

- [ ] **Testes locais**
  - [ ] `npm install` sem erros
  - [ ] `npm run dev` inicia sem problema
  - [ ] Página pública carrega em <3s (mobile)
  - [ ] Painel admin responde rápido (mobile)
  - [ ] Upload de fotos funciona
  - [ ] Compressão de imagem reduz para ~200KB
  - [ ] Filtros (Venda/Aluguel) mudam URL e conteúdo

- [ ] **Responsividade**
  - [ ] Testado em iPhone (375px)
  - [ ] Testado em tablet (768px)
  - [ ] Testado em desktop (1920px)
  - [ ] Nenhuma scroll horizontal
  - [ ] Botão WhatsApp sempre visível (mobile)

- [ ] **Performance**
  - [ ] `npm run build` sem erros
  - [ ] Vercel CLI pronta (`npm i -g vercel`)
  - [ ] Imagens otimizadas (WebP gerado)
  - [ ] CSS minificado
  - [ ] Zero console errors

- [ ] **Segurança**
  - [ ] Nenhuma chave Supabase hard-coded no código
  - [ ] RLS policies bloqueando acesso não-autenticado (escrita)
  - [ ] CORS configurado (apenas domínio Moleta)
  - [ ] Headers de segurança presentes (next.config.js)

---

## ✅ INTEGRAÇÃO SUPABASE

- [ ] **Dados de teste**
  - [ ] 4+ carros para aluguel cadastrados
  - [ ] 5+ carros para venda cadastrados
  - [ ] Fotos de qualidade para cada carro
  - [ ] Preços e descrições realistas

- [ ] **Queries testadas**
  - [ ] `SELECT * FROM veiculos WHERE status='disponivel'` retorna corretamente
  - [ ] Filter por categoria funciona
  - [ ] INSERT de novo veículo funciona via painel
  - [ ] DELETE de veículo funciona
  - [ ] UPDATE status para 'vendido' funciona

- [ ] **Storage testado**
  - [ ] Upload de imagem vai pro bucket
  - [ ] URL pública gerada corretamente
  - [ ] Imagem aparece no card do carro
  - [ ] Compressão mantém qualidade

---

## ✅ VERCEL DEPLOYMENT

- [ ] **Repositório GitHub**
  - [ ] Código commitado
  - [ ] `.env.local` NÃO commitado (em `.gitignore`)
  - [ ] `node_modules` NÃO commitado

- [ ] **Projeto Vercel criado**
  - [ ] Repositório GitHub conectado
  - [ ] Build settings automáticos (Next.js detectado)
  - [ ] Variáveis de ambiente addicionadas
    - [ ] `NEXT_PUBLIC_SUPABASE_URL`
    - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - [ ] `NEXT_PUBLIC_ADMIN_PASSWORD`

- [ ] **Deploy preview**
  - [ ] Deploy completou sem erros
  - [ ] URL preview gerada (vercel.app)
  - [ ] Homepage carrega em preview
  - [ ] Admin login funciona em preview
  - [ ] Fotos aparecem em preview
  - [ ] WhatsApp links clicáveis em preview

- [ ] **Performance em produção**
  - [ ] Lighthouse Mobile: 85+ (alvo 90+)
  - [ ] Lighthouse Desktop: 90+
  - [ ] First Contentful Paint: <1.5s
  - [ ] Largest Contentful Paint: <2.5s
  - [ ] Cumulative Layout Shift: <0.1

---

## ✅ VISUAL & UX

- [ ] **Design System aplicado**
  - [ ] Paleta LARANJA em CTAs
  - [ ] Paleta Azul em headers
  - [ ] Animações fade-in funcionando
  - [ ] Hover states em botões
  - [ ] Zoom em imagens ao hover

- [ ] **Componentes finalizados**
  - [ ] Header sticky com logo + WhatsApp
  - [ ] Hero section com CTA
  - [ ] FilterTabs mudando conteúdo
  - [ ] CarCard com foto + preço + botão
  - [ ] CarGrid responsivo
  - [ ] Footer com info Moleta

- [ ] **Acessibilidade**
  - [ ] Todos os inputs têm `<label>`
  - [ ] Botões têm `aria-label`
  - [ ] Imagens têm `alt` text
  - [ ] Links têm `:focus` states visíveis
  - [ ] Nenhuma interação apenas via mouse

---

## ✅ FUNCIONALIDADES CRÍTICAS

- [ ] **Vitrine pública**
  - [ ] Carros aparecem na galeria
  - [ ] Filtro "Todos" mostra todos
  - [ ] Filtro "Venda" mostra só venda
  - [ ] Filtro "Aluguel" mostra só aluguel
  - [ ] Clique no carro abre WhatsApp com mensagem correta

- [ ] **Painel admin**
  - [ ] Login com senha funciona
  - [ ] Logout limpa autenticação
  - [ ] Formulário valida campos obrigatórios
  - [ ] Upload de múltiplas fotos funciona
  - [ ] Compressão antes do upload
  - [ ] Carro aparece na lista após cadastro
  - [ ] Botão "Marcar como vendido" remove da galeria
  - [ ] Botão "Deletar" remove completamente
  - [ ] Lista atualiza ao deletar/marcar vendido

---

## ✅ DOCUMENTAÇÃO

- [ ] **README.md completo**
  - [ ] Setup instruções
  - [ ] Variáveis de ambiente
  - [ ] Como usar painel admin
  - [ ] Deploy Vercel passo-a-passo
  - [ ] Contato Marcelo

- [ ] **DEPLOY_CHECKLIST.md (este arquivo)**
  - [ ] Copiado e compartilhado com Marcelo
  - [ ] Marcelo confirmou que leu

---

## ✅ ENTREGA FINAL

- [ ] **Marcelo recebe:**
  - [ ] URL preview Vercel (vercel.app)
  - [ ] Credenciais Supabase (salvo em password manager)
  - [ ] Senha admin (salvo em password manager)
  - [ ] README completo
  - [ ] Instruções de contato

- [ ] **Marcelo testa:**
  - [ ] Homepage em celular (5 min)
  - [ ] Admin: cadastra 1 carro teste (5 min)
  - [ ] Verifica carro na galeria (2 min)
  - [ ] Clica WhatsApp e confirma mensagem (2 min)
  - [ ] Marca como vendido e verifica (2 min)

- [ ] **Depois que Marcelo confirmar tudo OK:**
  - [ ] Trocar senha admin para algo forte
  - [ ] Ativar Supabase Auth (se quiser mais segurança)
  - [ ] Apontar domínio próprio em Vercel
  - [ ] ✅ GO LIVE!

---

## 📋 Notas Importantes

> **ANTES DO DOMÍNIO DELE:**
- Nenhuma chave sensível no git
- Vercel preview testado com sucesso
- Supabase dados de produção OK
- Performance 85+
- Todas as funcionalidades ✅

> **DEPOIS DO DOMÍNIO:**
- Apontar DNS em Vercel
- Ativar SSL automático
- Subir deploy de main
- ✅ Live

---

**Status**: [ ] PRONTO | [ ] EM PROGRESSO | [ ] BLOQUEADO

**Última atualização**: 2026-09-13

**Responsável**: Claude (Autônomo)
