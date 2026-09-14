# 🧪 Guia de Teste Manual — Moleta Carros

> Siga este guia para validar que tudo funciona antes de ir pro domínio do Marcelo.

---

## ✅ PRÉ-TESTE

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] Supabase projeto criado e configurado
- [ ] `.env.local` preenchido com Supabase keys
- [ ] `npm install` executado com sucesso
- [ ] `npm run dev` iniciado (deve abrir na porta 3000)

---

## ✅ TESTE 1: Homepage Pública (5 min)

### Vitrine vazia inicialmente
1. Abrir `http://localhost:3000` em navegador
2. ✅ Ver header com logo "M" + botão WhatsApp
3. ✅ Ver hero section com "Encontre seu próximo carro"
4. ✅ Ver filtros: [ Todos ] [ 🚗 Venda ] [ 🔑 Locadora (4) ]
5. ✅ Ver mensagem "Nenhum veículo encontrado"
6. ✅ Clicar botão WhatsApp header → abre WhatsApp com mensagem

### Navegação
7. ✅ Clicar em [ 🚗 Venda ] → URL muda pra `?categoria=venda`
8. ✅ Clicar em [ 🔑 Locadora ] → URL muda pra `?categoria=aluguel`
9. ✅ Clicar em [ Todos ] → URL volta pra sem params
10. ✅ Nenhum console error

---

## ✅ TESTE 2: Painel Admin Login (3 min)

### Login
1. Abrir `http://localhost:3000/admin` em navegador
2. ✅ Ver tela de login com campo "Senha"
3. ✅ Digitar senha errada (ex: "123") → alerta "Senha incorreta"
4. ✅ Digitar `admin123` → logar e ir pra painel
5. ✅ Ver painel com 2 colunas: Formulário + Estoque

### Logout
6. ✅ Clicar botão "Sair" → voltar pra login
7. ✅ Atualizar página → pedir senha novamente (logout funcionou)

---

## ✅ TESTE 3: Cadastro de Carro (10 min)

### Preencher formulário
1. Logar novamente em `/admin`
2. Esquerda: formulário "Cadastrar Veículo"
3. ✅ Título: digitar "Hyundai Creta 2021 Branco"
4. ✅ Preço: digitar "45990" → ver valor em BRL "R$ 45.990"
5. ✅ Tipo: deixar "🚗 Venda" selecionado
6. ✅ Descrição: digitar "Carro em excelente estado, único dono"

### Upload de foto
7. ✅ Clicar em "Clique para enviar ou arrastar fotos"
8. ✅ Selecionar 1-3 fotos do seu disco (JPG ou PNG)
9. ✅ Ver preview das fotos no grid (3 colunas)
10. ✅ Esperar compressão → photos aparecem rapidinho
11. ✅ Ver contador "(3/10)" atualizado

### Submit
12. ✅ Clicar "➕ Cadastrar Veículo"
13. ✅ Botão muda pra "Salvando..." com spinner
14. ✅ Ver alerta "✅ Veículo cadastrado com sucesso!"
15. ✅ Formulário limpa (Título vazio, fotos removidas)

### Verificar na lista
16. ✅ Direita: aparecer card do carro na lista "Estoque (1)"
17. ✅ Card mostra: thumbnail + "Hyundai Creta 2021" + "R$ 45.990"
18. ✅ Card mostra badge "⏱️ Ativo" (verde)
19. ✅ Card tem botões "✓ Vendido" + "🗑️ Deletar"

---

## ✅ TESTE 4: Galeria Atualiza (3 min)

### Homepage com dados
1. Abrir `http://localhost:3000` em nova aba
2. ✅ Ver card do Hyundai na galeria
3. ✅ Card mostra: foto + "🚗 Venda" badge + título + "R$ 45.990" LARANJA
4. ✅ Botão "Quero mais info!" em LARANJA visível
5. ✅ Card tem ❤️ botão (favoritar)

### Filtros funcionam
6. ✅ Clicar [ 🔑 Locadora ] → galeria vazia (é venda, não aluguel)
7. ✅ Clicar [ Todos ] → Hyundai volta

### WhatsApp
8. ✅ Clicar botão "Quero mais info!" no card
9. ✅ Abrir WhatsApp com mensagem pré-preenchida:
   - "Olá Marcelo! Vi o veículo Hyundai Creta 2021..."
   - "R$ 45.990"
   - "Poderia me passar mais informações?"

---

## ✅ TESTE 5: Marcar Como Vendido (2 min)

### Admin
1. Voltar pra `/admin` em aba anterior
2. ✅ No card do Hyundai, clicar "✓ Vendido"
3. ✅ Alerta "✅ Marcado como vendido!"
4. ✅ Badge muda pra "✅ Vendido" (vermelho)
5. ✅ Botão "✓ Vendido" desaparece (não pode marcar 2x)

### Homepage
6. Ir pra aba da homepage e atualizar (`F5`)
7. ✅ Galeria mostra "Nenhum veículo encontrado"
8. ✅ Carro sumiu (status='vendido' não aparece)

---

## ✅ TESTE 6: Deletar Carro (2 min)

### Admin
1. Voltar pra `/admin`
2. ✅ No card do Hyundai, clicar "🗑️ Deletar"
3. ✅ Confirmar "Tem certeza que quer deletar este veículo?"
4. ✅ Alerta "✅ Veículo deletado!"
5. ✅ Card desaparece da lista
6. ✅ Estoque agora mostra "(0)"

---

## ✅ TESTE 7: Cadastro com Aluguel (3 min)

### Novo carro
1. Preencher formulário novamente
2. Título: "Fiat Kwid 2023 Prata"
3. Preço: "35000"
4. **Tipo**: Selecionar "🔑 Aluguel/Locadora" (IMPORTANTE!)
5. Descrição: "Perfeito para viagens curtas"
6. Upload 1-2 fotos
7. Cadastrar

### Verificar filtros
8. Homepage: clicar [ 🔑 Locadora (4) ]
9. ✅ Ver Fiat Kwid na galeria
10. ✅ Badge mostra "🔑 Aluguel"
11. ✅ Clicar [ 🚗 Venda ] → galeria vazia
12. ✅ Clicar [ Todos ] → Fiat volta

---

## ✅ TESTE 8: Responsividade (2 min)

### Mobile (375px)
1. Abrir DevTools (F12)
2. Ativar modo device (Ctrl+Shift+M)
3. Selecionar iPhone 12 (375px)
4. ✅ Header não tem scroll horizontal
5. ✅ Filtros deslizam (overflow-x auto)
6. ✅ Galeria é 1 coluna
7. ✅ Card cabe tudo na tela
8. ✅ Botão WhatsApp visível (não hidden)

### Tablet (768px)
9. Selecionar iPad (768px)
10. ✅ Galeria é 2 colunas
11. ✅ Tudo proporcional

### Desktop (1920px)
12. Selecionar Responsive → 1920px
13. ✅ Galeria é 3 colunas
14. ✅ Espaçamento confortável

---

## ✅ TESTE 9: Performance (2 min)

### DevTools Performance
1. Abrir DevTools (F12) → Lighthouse
2. ✅ Rodar análise Mobile
3. ✅ Performance score 85+ (alvo 90+)
4. ✅ First Contentful Paint < 1.5s
5. ✅ Cumulative Layout Shift < 0.1

### Console
6. ✅ Zero errors em console
7. ✅ Zero warnings (exceto polyfills)

---

## ✅ TESTE 10: Build Produção (5 min)

```bash
npm run build
npm run start

# Depois:
# Abrir http://localhost:3000 em navegador
```

1. ✅ Build completar sem erros
2. ✅ Rodar sequência de testes 1-5 no build produção
3. ✅ Tudo funcionar igual

---

## 📋 Checklist Final

- [ ] Todos os 10 testes passaram
- [ ] Zero console errors
- [ ] Performance 85+
- [ ] Admin login/logout funciona
- [ ] Cadastro salva no Supabase
- [ ] Homepage renderiza dados
- [ ] Filtros funcionam
- [ ] WhatsApp links abrem corretamente
- [ ] Responsividade OK (mobile/tablet/desktop)
- [ ] Build produção funciona

---

## 🚀 Quando TUDO passar:

1. Fazer commit: `git add . && git commit -m "feat: MVP Moleta Carros completo e testado"`
2. Fazer push: `git push origin main`
3. Conectar no Vercel
4. Aí sim: esperar domínio do Marcelo e apontar DNS

---

**Estimado**: ~45 min para rodar tudo  
**Resultado esperado**: ✅ TUDO VERDE  
