# Moleta — Plano de Leads, Categorias de Cliente e Painel (2 audiências)

> Status: **PLANEJAMENTO** (nada codado ainda). Documento de decisão, não de execução.
> Autor: Claude · Data: 2026-09-18 · Cliente: Moleta Carros (Uraí/PR — venda + aluguel)

---

## 0. Onde estamos HOJE (verdade, sem enfeite)

| Fato | Consequência |
|---|---|
| Único dado no banco: tabela `veiculos` | Não há histórico de comportamento nem de leads |
| Coluna `views` existe mas está **morta** (nunca incrementada, nunca lida) | "Carros mais vistos" hoje é impossível |
| Toda conversão sai por `wa.me` pro celular do Marcelo | O site vê o **clique**, mas nunca o **resultado** (vendeu? sumiu?) |
| Zero analytics instalado | Não sabemos de onde vem a visita (anúncio? Instagram? direto?) |
| Git: só há trabalho de CRO (Fase E) | **Nenhum** debate anterior sobre categorias/dados — greenfield |

**Conclusão:** não existe "dado deste cliente para analisar" ainda. O plano começa por **ligar a coleta**. Todo o resto (categorias, peneira, painel) depende disso.

---

## 1. A ideia-mãe: os MESMOS dados, DUAS lentes

Cada projeto de cliente gera dados que servem a duas pessoas diferentes:

- **Lente Marcelo (o cliente):** vender mais carro com **menos anúncio e menos esforço**, decidindo com dado em vez de achismo.
- **Lente Jorge (você):** a "peneira" — identificar de tudo que passa **quem é um possível cliente do SEU serviço** e onde há **upsell** no cliente atual.

Mesma coleta bruta. Dois painéis. Isso é o que escala pra todo site futuro (Tupperware, próximos): **uma camada de captura reutilizável** → um banco → duas visões.

---

## 2. Conformidade — ADIADA (decisão do Jorge, 2026-09-18)

> **LGPD não entra nesta fase.** Estamos planejando e executando a coleta primeiro;
> conformidade vira uma passada dedicada depois. Não é trava, não bloqueia nada aqui.
> Fica registrado só para retomar no momento certo (aviso de privacidade, opt-in de
> dado identificado, política). Até lá, seguimos.

**Divisão de propriedade (produto, não jurídico — deixar claro com o Marcelo quando fizer sentido):**
- Cliente final (quem quer comprar carro) → **do Marcelo**.
- Comportamento agregado + prospects "Tipo B" (donos de negócio que querem um site como esse) → **seus**.
- Monetização limpa pra você: **upsell no próprio Marcelo** (ex: dado mostra 40 comparadores/mês não convertidos → vender bot de follow-up) e **captar Tipo B**. (Revenda/disparo em massa fica fora — retomar na passada de conformidade.)

---

## 3. O que dá pra capturar (limpo) num site de catálogo

**Eventos anônimos (sem PII):**
- `page_view` (home / lista)
- `car_detail_view` — qual carro, tempo de permanência
- `gallery_open`, `video_play` — engajamento com mídia
- `filter_use` — venda vs aluguel, faixa de preço
- `whatsapp_click` — **o evento de conversão** (qual carro, de qual página)
- `return_visit` — id anônimo em localStorage
- Metadados por sessão: origem (referrer/UTM), região aproximada, dispositivo, hora/dia

**Dado identificado (fase futura, opcional, com opt-in):**
- Mini-form "quero que me avisem quando entrar carro assim" → nome/telefone consentidos.

**O buraco negro do WhatsApp:** vemos o clique, não o desfecho. Pra fechar o ciclo, o **Marcelo marca o resultado** ("vendeu / negociando / sumiu / curioso") — é a ponte entre comportamento anônimo e venda real. Sem isso, nunca sabemos o que converte de verdade.

---

## 4. Categorias de cliente (a "peneira") — derivadas do negócio real

Segmentação por comportamento observável (regras simples primeiro; ML só se um dia valer):

| # | Segmento | Sinais | Ação sugerida |
|---|---|---|---|
| 1 | **Comprador quente** 🔥 | 1-2 carros, abriu galeria/vídeo, tempo alto, clicou WhatsApp com carro específico | Marcelo prioriza atendimento |
| 2 | **Comparador** 🟡 | Vê muitos carros, volta várias vezes, filtra preço, **não** clicou | Nutrir (novidades, retargeting barato) |
| 3 | **Curioso de preço** ❄️ | Entra, olha preço, sai rápido | Provável fora de faixa — não gastar energia |
| 4 | **Locação (aluguel)** 🔑 | Filtra aluguel, urgência/curto prazo | Fluxo/oferta diferente de venda |
| 5 | **Recorrente/fiel** 🔁 | Volta periodicamente | Indicação / revenda futura |
| 6 | **Local curioso** 👋 | Região, sem intenção de compra | Ruído amistoso — ignorar na métrica |
| 7 | **Bot/ruído** 🤖 | Datacenter, fora do BR | Filtrar (lição já aprendida no PostHog do EIXO) |
| B | **Prospect Tipo B (SEU)** 💰 | Fuça `/admin`, pergunta "como fez o site", perfil dono de negócio | Vira lead de serviço pro Jorge |

**Score de intenção (v1, regras):**
- Clicou WhatsApp em carro específico → **HOT**
- ≥3 carros + galeria/vídeo + sem clique → **WARM**
- 1 view rápido + saída → **COLD**

---

## 5. Os dois painéis

### 5A. Painel do Marcelo — "o que acontece por trás"
Objetivo: refletir e decidir melhor → **mais venda, menos anúncio, menos esforço**.
Linguagem: **não-técnica, visual, mobile** (ele usa celular).

- 🏆 **Carros mais vistos** → sabe o que dá tração; destaca e compra mais desse perfil
- 🥶 **Carros que ninguém olha** → parado: baixa preço ou troca as fotos
- 🎥 **Vídeo/foto importa?** → carros com vídeo geram mais clique?
- 💬 **Cliques no WhatsApp por carro** → o que realmente gera contato
- ⏰ **Horário/dia de pico** → quando postar e anunciar
- 📍 **De onde vem a visita** (Instagram? anúncio? direto?) → **onde vale gastar anúncio** (o ponto "menos anúncio, mais assertivo")
- 📊 **Funil**: visitas → viram detalhe → clicaram WhatsApp → (fechou? ele marca)
- 🌡️ **Termômetro da semana**: quantos leads quentes

### 5B. Painel do Jorge — a peneira / prospecção
- Sessões/leads classificados por segmento (seção 4)
- Sinal **Tipo B** por projeto
- **Visão cross-project** (Moleta + Tupperware + futuros) = seu CRM único
- Saúde do site do cliente (prova de valor → justifica recorrência/upsell)
- **Oportunidades de upsell** no cliente atual (ex: "X comparadores/mês vazando → oferecer bot de follow-up")

---

## 6. Arquitetura em fases (barata, incremental)

**Fase 0 — Fundação de dados (fazer PRIMEIRO, sem painel):**
- Reviver `views` + criar tabela `eventos` (anônima): `event_type`, `vehicle_id`, `session_id`, `referrer/utm`, `ts`, `region`, `device`
- Instrumentar os eventos da seção 3 no front (Client Components já existem)
- `session_id` anônimo em localStorage · sem PII · aviso curto de privacidade
- **Começa a acumular histórico JÁ** → quando o painel existir, ele terá passado pra mostrar
- Storage: Supabase (mesmo projeto), tabelas `eventos` e (futuro) `leads` — padrão reutilizável em todo site

**Fase 1 — Painel Marcelo** (lê `eventos`, gráficos simples).
**Fase 2 — Peneira + CRM cross-project do Jorge.**
**Fase 3 — Fechamento de ciclo** (Marcelo marca desfecho) + form de lead identificado opcional.

> Regra de ouro: **Fase 0 é o único passo urgente.** Enquanto ela não roda, todo dado que passa hoje é perdido pra sempre. Painéis podem esperar; a coleta não.

---

## 7. Decisões que dependem de você (Jorge)

1. **Fechamento de ciclo:** o Marcelo topa marcar o desfecho dos contatos? (é o que faz o dado virar ouro) — pode ficar pra Fase 3.
2. **Ordem:** confirmo Fase 0 já (coleta silenciosa acumulando) e desenhamos os painéis com dado real daqui a X semanas?
3. **Escopo do painel do Marcelo:** entregar como parte do serviço (valor agregado) ou como upsell pago?

> Conformidade (LGPD) foi **adiada** por decisão do Jorge — não é decisão desta fase (ver seção 2).

---

## 9. CATÁLOGO COMPLETO DE COLETA (engenharia social — máximo por contato)

> Objetivo: saber o máximo possível sobre cada contato, venha de onde vier.
> Coluna **Confiança** é honestidade de engenharia — dado medido ≠ inferência chutada.
> Coluna **Custo** = F(grátis, próprio) · 3P(serviço terceiro, pago) · L(loop do Marcelo).

### Camada A — O que o navegador/servidor entrega sozinho (sem pedir nada)
| Dado | Como coleta | Confiança | Custo | Pra que serve |
|---|---|---|---|---|
| IP → cidade/região | GeoIP no server | Alta (cidade), média (bairro) | F | Local vs fora; foco geográfico de anúncio |
| ISP / ASN / tipo de conexão | GeoIP (ASN) | Alta | F | Detecta datacenter/VPN/bot vs banda larga vs operadora móvel |
| SO + versão | User-Agent | Alta | F | iOS vs Android antigo → proxy de poder aquisitivo |
| Navegador + versão | User-Agent | Alta | F | Perfil técnico; detecção de bot |
| Mobile / desktop / tablet | User-Agent + client hints | Alta | F | Comportamento e urgência diferem por device |
| Marca/modelo aproximado | Client Hints (Sec-CH-UA) | Média | F | iPhone 15 vs Moto G → faixa de renda (fraco, mas soma) |
| Idioma preferido | Accept-Language | Alta | F | pt-BR local vs estrangeiro (ruído) |
| Fuso horário | JS (Intl API) | Alta | F | Confirma região; separa bot |
| Resolução + densidade de tela | JS | Alta | F | Aparelho caro vs simples (proxy fraco de renda) |

### Camada B — Identidade sem login (reconhecer a MESMA pessoa)
| Dado | Como coleta | Confiança | Custo | Pra que serve |
|---|---|---|---|---|
| Session ID | localStorage/cookie próprio | Alta | F | Amarra ações de uma visita |
| Device fingerprint | Canvas/WebGL/áudio/fontes/hardware | Média-Alta | F | Reconhece retorno mesmo sem cookie; liga sessões |
| Cross-device parcial | Fingerprint + rede + padrão | Baixa-Média | F | Mesma pessoa no celular e no PC (aproximado) |

### Camada C — Comportamento no site (o mais valioso — é fato medido)
| Dado | Como coleta | Confiança | Custo | Pra que serve |
|---|---|---|---|---|
| Carros vistos + ordem | Evento `car_detail_view` | Alta | F | Afinidade de produto |
| Tempo em cada carro (dwell) | Timer no detalhe | Alta | F | Interesse real vs passagem |
| Profundidade de scroll | Listener | Alta | F | Leu tudo? só topo? |
| Galeria: fotos vistas / zoom | Evento `gallery_open` | Alta | F | Engajamento visual |
| Vídeo: play + % assistido | Evento `video_play` | Alta | F | Vídeo converte? qual carro? |
| Filtros usados (venda/aluguel, preço) | Evento `filter_use` | Alta | F | Intenção declarada |
| Clique no WhatsApp (+ qual carro) | Evento `whatsapp_click` | Alta | F | **Evento de conversão** |
| Rage clicks / hesitação | Listener de clique/mouse | Média | F | Frustração / dúvida (UX + temperatura) |
| Nº de sessões + intervalo | Fingerprint + histórico | Alta | F | Recorrência (comparador vs decidido) |
| Caminho completo (jornada) | Sequência de eventos | Alta | F | Funil real, ponto de abandono |

### Camada D — Afinidade derivada (calculada do comportamento)
| Dado | Como deriva | Confiança | Custo | Pra que serve |
|---|---|---|---|---|
| Faixa de preço de interesse | Média/mediana dos carros vistos | Alta | F | Segmentar oferta |
| Comprar vs alugar | Filtros + carros vistos | Alta | F | Fluxo diferente |
| Perfil de veículo (econômico/premium/porte) | Carros vistos | Alta | F | Que estoque atrai quem |
| Marca preferida | Frequência | Média | F | Recomendação |

### Camada E — Inferência social/psicográfica (⚠️ chute calibrado — usar com pé atrás)
| Dado | Como infere | Confiança | Custo | Pra que serve |
|---|---|---|---|---|
| Poder aquisitivo | Device + tela + faixa de preço + região | **Baixa-Média** | F | Priorização (nunca como verdade) |
| Urgência | Aluguel + horário + velocidade de clique | Média | F | Quão rápido atender |
| Estágio de decisão | Recorrência + dwell + galeria | Média-Alta | F | Comparador vs pronto p/ fechar |
| Perfil B2B (prospect Tipo B) | Fuça `/admin`, padrão de navegação, origem | Média | F | Lead de serviço pro Jorge |
| Faixa etária / gênero | **NÃO observável tecnicamente** | **Nenhuma** | 3P/form | Só via formulário ou enrichment — não fingir que sabe |

### Camada F — Identidade real (quando o contato entrega ou o Marcelo repassa)
| Dado | Como coleta | Confiança | Custo | Pra que serve |
|---|---|---|---|---|
| Nome / telefone / email | Formulário opt-in | Alta | F | Lead identificado |
| Telefone (do clique WhatsApp) | **Só o Marcelo tem** — loop | Alta | L | Ponte comportamento→pessoa |
| Nome + foto + status do WhatsApp | Marcelo repassa / API | Alta | L | Enriquece o contato |
| DDD → região, operadora | Do número | Alta | F | Confirma origem |
| Redes sociais / dados do telefone | Serviço de enrichment | Média | 3P | Perfil ampliado (pago, cinza) |

### Camada G — Desfecho (o loop do Marcelo — transforma dado em ouro)
| Dado | Como coleta | Confiança | Custo | Pra que serve |
|---|---|---|---|---|
| Resultado (vendeu/negociando/sumiu/fora de faixa) | Marcelo marca | Alta | L | **Calibra o que converte de verdade** |
| Valor fechado | Marcelo marca | Alta | L | ROI real por canal/segmento |
| Tempo até fechar | Cálculo | Alta | L | Velocidade do funil |

### Camada H — Cross-project (o CRM único do Jorge)
| Dado | Como coleta | Confiança | Custo | Pra que serve |
|---|---|---|---|---|
| Mesmo fingerprint/telefone em vários sites | Chave comum entre projetos | Média-Alta | F | Perfil consolidado da pessoa |
| Comportamento agregado inter-sites | União de eventos | Alta | F | Visão 360° pra prospecção |

---

## 10. Vale pré-análise por PARTIÇÕES? Sim. Quais, como, por quê.

**Vale — e é obrigatório.** Evento cru é ruído; partição é o que vira decisão.
Sem partição você tem "1.200 visitas"; com partição você tem "300 vieram de anúncio e
0 fecharam → corta o anúncio". A partição é o que gera o "menos anúncio, mais assertivo".

**Duas coisas diferentes chamadas "partição":**
- **Analítica (cohortes/segmentos)** → é onde está o valor. Fazer já.
- **Física (particionar tabela no banco)** → só quando volume justificar (mensal por `criado_em`). Hoje volume é baixo → **não** particionar fisicamente ainda; só append-only + views derivadas.

### Partições analíticas (dimensões de corte) — cada uma responde uma pergunta de negócio
| # | Partição | Como se calcula | Por que existe (decisão que destrava) |
|---|---|---|---|
| 1 | **Canal de origem** (anúncio/orgânico/Instagram/direto) | Referrer + UTM | Onde gastar e onde **parar** de gastar anúncio |
| 2 | **Temperatura** (HOT/WARM/COLD) | Score de intenção (seção 4) | Quem o Marcelo atende primeiro |
| 3 | **Afinidade de produto** (faixa preço, venda/aluguel, porte) | Camada D | Que estoque comprar; que oferta mostrar |
| 4 | **Geografia** (local Uraí vs fora) | Camada A | Raio de anúncio; frete/logística |
| 5 | **Poder aquisitivo (proxy)** | Camada E (⚠️ baixa confiança) | Priorização suave — nunca corte duro |
| 6 | **Temporal** (hora/dia/semana) | Timestamp | Quando postar e anunciar |
| 7 | **Recência/Frequência** (novo vs recorrente) | Fingerprint + histórico | Comparador precisa de nutrição, não de pressão |
| 8 | **Ruído** (bot/datacenter/estrangeiro) | Camada A (ASN, idioma, fuso) | **Descartar** da métrica — senão contamina tudo |
| 9 | **Tipo B — prospect do Jorge** | Camada E + comportamento | Peneira: lead do SEU serviço |

### Como implementar as partições (arquitetura)
1. `eventos` cru = **append-only** (nunca editar; fonte da verdade)
2. Rollup agendado → tabela/view `perfil_sessao` (1 linha por sessão, com todos os campos derivados + labels de partição)
3. Rollup → `perfil_contato` (consolida sessões da mesma pessoa via fingerprint/telefone)
4. Painéis leem as views, nunca o cru → rápido e barato
5. Método de classificação: **regras primeiro** (RFM-like: Recência, Frequência, Intenção). ML só quando houver volume e o desfecho do Marcelo (Camada G) para treinar.

### Por que RFM/regras antes de ML (honestidade)
- Volume hoje = ~zero. ML sem dado é teatro.
- Regras já acertam ~90% e são explicáveis ("por que HOT? clicou no WhatsApp").
- Quando a Camada G (desfecho) tiver histórico, aí sim ML tem o que aprender.

---

## 8. O que este plano NÃO é
- Não é revenda de contatos nem disparo em massa (risco proibido — seção 2).
- Não é ML/IA de segmentação agora (regras simples resolvem 90%; ML só quando houver volume).
- Não assume dado que não existe — tudo parte de coleta a construir.

---

# PARTE II — ENGENHARIA: Grafo de Identidade EIXO ("MALHA")

> Solução **construída por nós** (não fornecedor). First-party, Brasil-nativo, cresce por
> efeito de rede a cada cliente. Objetivo: capturar o máximo por contato **antes** do
> handoff ao Marcelo, e fazer "anônimo de primeira vez" virar exceção na rede.

## 11. Verdade-âncora (o limite de física que respeitamos)
Navegador de visitante 100% anônimo, 1ª vez, que nunca enviou nada → **não carrega telefone**.
Isso é do navegador, não de fornecedor. Estratégia: cada pessoa é semeada **uma vez** (envio
no bot OU form), e a partir daí é reconhecida em **todos** os sites da rede. A MALHA fecha a lacuna com o tempo.

## 12. As camadas (com sub-partes que também dá pra visar)

### Camada 1 — Coletor (script first-party no site) · roda hoje, sem VPS/bot
Captura no browser e manda pro gateway. **Sub-alvos além do óbvio:**
- `device_fp` estável (canvas/webgl/fontes/hardware) + session_id
- **`fbclid` / `gclid` / UTM** ← liga o lead ao anúncio exato (ROI por anúncio = "menos anúncio, mais assertivo")
- Cadeia de referrer, idioma(s), timezone, `connection.effectiveType` (4G/wifi = proxy de rede)
- Toque vs mouse, orientação, DPR/resolução (proxy de aparelho)
- Teste de incógnito (localStorage persiste?), retorno (cookie first-party)
- Jornada: carros vistos, dwell, galeria/vídeo, scroll, rage-click

### Camada 2 — Gateway de clique (rota server-side) · roda hoje
Botão → `/api/go?...` → grava sinal rico server-side → 302 pro WhatsApp. **Sub-alvos:**
- IP real + **ASN/datacenter** (filtro de bot), geo, headers, `Accept-Language`
- **JA3/TLS + HTTP fingerprint** (server vê o que o JS não vê; resiste a adblock)
- **Velocidade de intenção** (tempo carregou→clicou)
- **Token-ponte**: injeta `[ref: XXXX]` no texto pré-pronto do `wa.me` (a ponte navegação↔telefone)

### Camada 3 — Grafo (Postgres/Supabase) · roda hoje
Tabelas `mesh_*`. **Sub-alvos:**
- Ligação **probabilística** (mesmo IP+UA em janela curta → mesmo suspeito)
- Cluster por IP (residência/família), DDD→região, operadora, WhatsApp Business?
- Arestas **cross-site** (o ativo que cresce)

### Camada 4 — Semeador (bot WhatsApp) · ⚠️ BLOQUEADO na infra hoje (Evolution/WhatsApp pareado fora)
- Webhook recebe `[ref: XXXX]` → resolve device_fp → **casa telefone ↔ todo histórico anônimo**
- Sub-alvo: no seed, herda o `fbclid`/UTM → você sabe **qual anúncio** trouxe aquele telefone
- **Não declarar funcionando até envio real testado** (memória: testar surface real, sem verde falso)

### Camada 5 — Enriquecedor + Peneira · após haver volume
- RFM/regras (Recência, Frequência, Intenção) → HOT/WARM/COLD + segmentos (seção 4)
- Perfil comportamental cruzado entre sites → CRM único do Jorge + sinal Tipo B

## 13. Salvaguardas anti-corrupção (regras que o código obedece)
| Regra | Por quê |
|---|---|
| Gateway **SEMPRE** faz 302, mesmo se o DB falhar (grava em fire-and-forget com `.catch`) | Nunca quebrar a experiência do visitante nem perder a venda do Marcelo [GB-02] |
| `mesh_sinal` é **append-only** | Fonte da verdade nunca é sobrescrita/corrompida |
| Upsert de device/identidade **idempotente** (`ON CONFLICT` com target) | Clique duplicado → 1 lead lógico, sem lixo |
| Ref token **assinado/curto e validado**; ref inválido → bot ignora sem erro | Não deixa injeção corromper o grafo |
| Rate-limit + filtro de bot (ASN datacenter) antes de gravar | Não contaminar métrica com ruído |
| Datas server-side em UTC via `BR_OFFSET_MS` | [GB-03] hora errada no VPS |
| Nada de PII em log em texto puro | Higiene (conformidade adiada, mas higiene não) |

## 14. Plano de testes — por micro-parte, até interação real
> Ordem canônica do projeto: unit (<1s) → guards → integração → e2e → interação real.
> Regra: **"verde" só vale se exercita o efeito numa dimensão de falha real** (memória).

| # | Micro-parte | Tipo | Como valida | Ferramenta |
|---|---|---|---|---|
| T1 | Token-ponte encode/decode | Unit | roundtrip fp→ref→fp idêntico; ref adulterado rejeita | vitest |
| T2 | Normalização de telefone/DDD | Unit | vários formatos BR → E.164; DDD→região | vitest |
| T3 | `device_fp` estável | Unit | mesmo input → mesmo hash; incógnito não quebra | vitest |
| T4 | Validação de sinal (schema) | Unit | payload ruim rejeita; bom passa | vitest + zod |
| T5 | Classificador de ruído/bot | Unit | ASN datacenter/estrangeiro → descartado | vitest |
| G1 | **Gateway nunca bloqueia** | Guard | DB forçado a falhar → ainda 302 pro wa.me | vitest (mock) |
| G2 | Upsert idempotente | Guard | 2 cliques → 1 device, 1 lead | teste integração |
| G3 | Append-only | Guard | tentativa de update em `mesh_sinal` some/barra | teste SQL |
| I1 | Grava sinal | Integração | POST /api/track → linha no Supabase | vitest + Supabase |
| I2 | Resolve conhecido | Integração | 2ª visita do fp → retorna telefone semeado | vitest + Supabase |
| E1 | Clique→redirect | E2E | click WhatsApp → 302 com `[ref]`; /api/track disparou; 0 erro console | playwright |
| E2 | Incógnito/adblock | E2E | gateway ainda loga server-side | playwright |
| **R1** | **Seed real via WhatsApp** | **Interação real** | envio real com ref → webhook casa telefone no grafo | **manual — GATED na infra** |
| R2 | fbclid→lead→anúncio | Interação real | lead semeado mostra qual anúncio trouxe | manual |

## 15. Mapa de deploy (cada coisa no seu destino — sem misturar)
| Artefato | Destino | Como | Autônomo? |
|---|---|---|---|
| Coletor + rotas `/api/track`,`/api/go` (Next.js) | Repo `gameplayjorge12-coder/moleta-carros` → **Vercel** | `git push` → deploy automático | commit sim; push/deploy → confirmar |
| Migration `mesh_*` | **Supabase do Moleta** | migration SQL aplicada | aplicar → confirmar |
| Federação central + handler de seed do bot | **VPS `/opt/eixo`** | rsync + `pm2 restart bot` (+ `sync-n8n` se workflow) | ⚠️ só quando infra voltar |
| **Regra** | Código do Moleta **nunca** vai pro repo do bot; código do bot **nunca** vai pra Vercel | separação de trilhos | — |

## 16. Fases de execução (ordem travada — só avança com a anterior verde)
- **F0 — Fundação (hoje):** migration `mesh_*` no Supabase + `/api/track` + `/api/go` + coletor + testes T1–T5, G1–G3, I1–I2, E1–E2. Não depende de ninguém.
- **F1 — Semeadura:** integrar token-ponte no bot EIXO. **Bloqueado** até Evolution + WhatsApp pareado (R1/R2).
- **F2 — Painel Marcelo** (lê o grafo/eventos).
- **F3 — Peneira + CRM cross-project + federação central na VPS.**
