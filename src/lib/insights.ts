/**
 * Copiloto Moleta — motor de inteligência (Fase 1, regras puras, sem LLM).
 * Modela COTIDIANO HUMANO, não só dados:
 *  - desejo = REPETIÇÃO (mesmo visitante que volta vale mais que 10 curiosos)
 *  - madrugada mente (tráfego 0-6h BR é descontado p/ não confundir bot com interesse)
 *  - o Marcelo DORME (lead fora do expediente → "responda de manhã", não "já")
 *  - não gritar no silêncio normal (alerta de "sem visita" só depois do meio-dia)
 *  - o mundo offline desincroniza (carro velho + com movimento → "ainda disponível?")
 *  - prova de valor na língua dele (quantos contatos/visitas o site trouxe)
 *
 * Função PURA (dados + relógio) → 100% testável, sem I/O.
 * [GB-03] Fuso BR por offset explícito — NUNCA getHours() de servidor.
 */

const BR_OFFSET_MS = -3 * 60 * 60 * 1000; // America/Sao_Paulo (UTC-3)
const DIA_MS = 24 * 60 * 60 * 1000;
const EXPEDIENTE_INICIO = 8; // 8h BR
const EXPEDIENTE_FIM = 20; // 20h BR
const MOVIMENTO_ESPERADO_APOS = 12; // só alarma "sem visita" depois do meio-dia
const DIURNO_INICIO = 7; // views "de verdade" p/ pico: 7h–23h

export type SinalRow = {
  tipo: string;
  veiculo_id: string | null;
  device_fp: string | null;
  criado_em: string | Date;
};

export type VeiculoRow = {
  id: string;
  titulo: string | null;
  preco: number | null;
  categoria?: string | null;
  status: string | null;
  fotos: string[] | null;
  created_at: string | Date;
};

export type Nivel = 'verde' | 'amarelo' | 'vermelho';

export type Alerta = {
  nivel: Nivel;
  titulo: string;
  detalhe: string;
  veiculo_id?: string;
  valor?: number;
};

export type CarHeat = {
  id: string;
  titulo: string;
  preco: number;
  status: string;
  viewsHoje: number;
  views7d: number;
  visitantesUnicos: number; // quantas pessoas distintas
  retornos: number; // quantas VOLTARAM (desejo)
  contatos7d: number;
  score: number; // 0-100 termômetro de desejo
};

export type Lead = {
  veiculo_id: string | null;
  titulo: string | null;
  quandoISO: string;
  foraDoExpediente: boolean;
};

export type Insights = {
  geradoEmISO: string;
  foraDoExpedienteAgora: boolean;
  hoje: {
    visitantes: number;
    pageviews: number;
    carrosVistos: number;
    contatos: number;
    valorVitrine: number;
  };
  semana: { visitantes: number; carrosVistos: number; contatos: number; retornos: number };
  provaDeValor: string;
  briefing: { vitoria: string | null; atencao: string | null; acao: string | null };
  alertas: Alerta[];
  carros: CarHeat[];
  leadsQuentes: Lead[];
};

function brDate(ms: number): string {
  return new Date(ms + BR_OFFSET_MS).toISOString().slice(0, 10);
}
function brHour(ms: number): number {
  return new Date(ms + BR_OFFSET_MS).getUTCHours();
}
function ts(v: string | Date): number {
  return v instanceof Date ? v.getTime() : new Date(v).getTime();
}
const isView = (t: string) => t === 'page_view' || t === 'car_detail_view';
const foraExpediente = (h: number) => h < EXPEDIENTE_INICIO || h >= EXPEDIENTE_FIM;

/** Motor principal. `nowUtc` injetável p/ testes determinísticos. */
export function computeInsights(
  signals: SinalRow[],
  vehicles: VeiculoRow[],
  nowUtc: Date = new Date()
): Insights {
  const now = nowUtc.getTime();
  const hojeStr = brDate(now);
  const horaAgora = brHour(now);
  const foraAgora = foraExpediente(horaAgora);
  const seteDiasAtras = now - 7 * DIA_MS;
  const umDiaAtras = now - DIA_MS;

  const sig = signals.filter(
    (s) =>
      ts(s.criado_em) >= seteDiasAtras &&
      !(s.device_fp && s.device_fp.startsWith('TESTFP_'))
  );
  const byId = new Map(vehicles.map((v) => [v.id, v]));

  // ---- Resumo dia/semana ----------------------------------------------------
  const visitantesHoje = new Set<string>();
  const visitantesSemana = new Set<string>();
  const carrosVistosHoje = new Set<string>();
  const carrosVistosSemana = new Set<string>();
  let pageviewsHoje = 0;
  let contatosHoje = 0;
  let contatosSemana = 0;

  for (const s of sig) {
    const t = ts(s.criado_em);
    const ehHoje = brDate(t) === hojeStr;
    if (s.device_fp) {
      visitantesSemana.add(s.device_fp);
      if (ehHoje) visitantesHoje.add(s.device_fp);
    }
    if (isView(s.tipo) && ehHoje) pageviewsHoje++;
    if (s.tipo === 'car_detail_view' && s.veiculo_id) {
      carrosVistosSemana.add(s.veiculo_id);
      if (ehHoje) carrosVistosHoje.add(s.veiculo_id);
    }
    if (s.tipo === 'whatsapp_click') {
      contatosSemana++;
      if (ehHoje) contatosHoje++;
    }
  }
  const valorVitrine = [...carrosVistosHoje].reduce(
    (acc, id) => acc + (byId.get(id)?.preco ?? 0),
    0
  );

  // ---- Agregação por carro (com RETORNO por dispositivo) --------------------
  type Agg = {
    viewsHoje: number;
    viewsHojeDiurno: number;
    views7d: number;
    contatos7d: number;
    contatos24h: number;
    porDevice: Map<string, { views: number; dias: Set<string> }>;
  };
  const agg = new Map<string, Agg>();
  const getAgg = (id: string): Agg => {
    let a = agg.get(id);
    if (!a) {
      a = { viewsHoje: 0, viewsHojeDiurno: 0, views7d: 0, contatos7d: 0, contatos24h: 0, porDevice: new Map() };
      agg.set(id, a);
    }
    return a;
  };

  for (const s of sig) {
    if (!s.veiculo_id) continue;
    const a = getAgg(s.veiculo_id);
    const t = ts(s.criado_em);
    const dia = brDate(t);
    const hora = brHour(t);
    if (s.tipo === 'car_detail_view') {
      a.views7d++;
      if (dia === hojeStr) {
        a.viewsHoje++;
        if (hora >= DIURNO_INICIO) a.viewsHojeDiurno++;
      }
      if (s.device_fp) {
        let d = a.porDevice.get(s.device_fp);
        if (!d) { d = { views: 0, dias: new Set() }; a.porDevice.set(s.device_fp, d); }
        d.views++;
        d.dias.add(dia);
      }
    } else if (s.tipo === 'whatsapp_click') {
      a.contatos7d++;
      if (t >= umDiaAtras) a.contatos24h++;
    }
  }

  // retornos = dispositivos que voltaram (2+ views OU viram em 2+ dias)
  const retornosDe = (a: Agg) => {
    let r = 0;
    for (const d of a.porDevice.values()) if (d.views >= 2 || d.dias.size >= 2) r++;
    return r;
  };
  // O dispositivo mais engajado no carro (pra detectar "namoro").
  const maisEngajadoDe = (a: Agg) => {
    let views = 0;
    let dias = 0;
    for (const d of a.porDevice.values()) {
      if (d.views > views) views = d.views;
      if (d.dias.size > dias) dias = d.dias.size;
    }
    return { views, dias };
  };

  const rawScore = (a: Agg) => a.views7d + retornosDe(a) * 3 + a.contatos7d * 5;
  const zero: Agg = { viewsHoje: 0, viewsHojeDiurno: 0, views7d: 0, contatos7d: 0, contatos24h: 0, porDevice: new Map() };
  const maxRaw = Math.max(0, ...vehicles.map((v) => rawScore(agg.get(v.id) ?? zero)));

  let retornosSemana = 0;
  const carros: CarHeat[] = vehicles
    .map((v) => {
      const a = agg.get(v.id) ?? zero;
      const ret = retornosDe(a);
      retornosSemana += ret;
      return {
        id: v.id,
        titulo: v.titulo ?? 'Veículo',
        preco: v.preco ?? 0,
        status: v.status ?? 'disponivel',
        viewsHoje: a.viewsHoje,
        views7d: a.views7d,
        visitantesUnicos: a.porDevice.size,
        retornos: ret,
        contatos7d: a.contatos7d,
        score: maxRaw > 0 ? Math.round((rawScore(a) / maxRaw) * 100) : 0,
      };
    })
    .sort((x, y) => y.score - x.score || y.views7d - x.views7d);

  // ---- Alertas (semáforo) ---------------------------------------------------
  const alertas: Alerta[] = [];
  for (const v of vehicles) {
    const a = agg.get(v.id) ?? zero;
    const titulo = v.titulo ?? 'Veículo';
    const preco = v.preco ?? 0;
    const disponivel = (v.status ?? 'disponivel') === 'disponivel';
    const idadeDias = Math.floor((now - ts(v.created_at)) / DIA_MS);
    const fotos = v.fotos ?? [];

    // 🟢 lead quente (24h) — respeita o sono do Marcelo
    if (a.contatos24h > 0) {
      alertas.push({
        nivel: 'verde',
        titulo: 'Alguém quer esse carro',
        detalhe: foraAgora
          ? `Chamaram no WhatsApp sobre o ${titulo}. Responda assim que abrir a loja de manhã.`
          : `Chamaram agora sobre o ${titulo}. Responda rápido enquanto está quente.`,
        veiculo_id: v.id,
        valor: preco,
      });
    }
    // 🟢 namoro (mesma pessoa VOLTOU) — desejo real
    const eng = maisEngajadoDe(a);
    if (eng.dias >= 2 || eng.views >= 3) {
      const quantas = Math.max(eng.views, eng.dias);
      alertas.push({
        nivel: 'verde',
        titulo: 'Tem gente namorando esse carro',
        detalhe: `Alguém já voltou ${quantas}x pra ver o ${titulo}. Interesse forte — vale um empurrãozinho (story, condição).`,
        veiculo_id: v.id,
      });
    }
    // 🟢 pico HOJE (só views diurnas — madrugada é bot)
    if (a.viewsHojeDiurno >= 3 && a.viewsHojeDiurno >= 2 * (a.views7d / 7)) {
      alertas.push({
        nivel: 'verde',
        titulo: 'Carro bombando hoje',
        detalhe: `O ${titulo} teve ${a.viewsHojeDiurno} visualizações hoje. Bom momento pra um story ou destaque.`,
        veiculo_id: v.id,
      });
    }
    if (!disponivel) continue;
    // 🔴 sem foto
    if (fotos.length === 0) {
      alertas.push({
        nivel: 'vermelho',
        titulo: 'Carro sem foto',
        detalhe: `O ${titulo} está sem nenhuma foto — ninguém compra o que não vê. Suba fotos.`,
        veiculo_id: v.id,
      });
    }
    // 🔴 invisível (7+ dias, 0 view)
    else if (idadeDias >= 7 && a.views7d === 0) {
      alertas.push({
        nivel: 'vermelho',
        titulo: 'Carro invisível',
        detalhe: `O ${titulo} está há ${idadeDias} dias no ar e ninguém viu essa semana. Reposte ou destaque.`,
        veiculo_id: v.id,
      });
    }
    // 🟡 "ainda disponível?" (velho + com movimento) — corrige drift offline
    else if (idadeDias >= 14 && a.views7d >= 3) {
      alertas.push({
        nivel: 'amarelo',
        titulo: 'Ainda está disponível?',
        detalhe: `O ${titulo} está há ${idadeDias} dias no ar e ainda recebe visitas. Se já vendeu, marque como vendido pra não perder tempo com quem chamar.`,
        veiculo_id: v.id,
      });
    }
    // 🟡 interesse parado (olham e não chamam)
    else if (a.views7d >= 4 && a.contatos7d === 0) {
      alertas.push({
        nivel: 'amarelo',
        titulo: 'Interesse parado',
        detalhe: `${a.views7d} pessoas olharam o ${titulo} essa semana e nenhuma chamou. Talvez preço ou as fotos.`,
        veiculo_id: v.id,
        valor: preco,
      });
    }
  }
  // 🟡 silêncio — só alarma depois do horário de movimento (não às 6h nem de madrugada)
  if (pageviewsHoje === 0 && horaAgora >= MOVIMENTO_ESPERADO_APOS) {
    alertas.push({
      nivel: 'amarelo',
      titulo: 'Sem visitas hoje ainda',
      detalhe: 'Ninguém entrou no site hoje até agora. Um story ou post costuma trazer gente.',
    });
  }

  const ordem: Record<Nivel, number> = { verde: 0, vermelho: 1, amarelo: 2 };
  alertas.sort((x, y) => ordem[x.nivel] - ordem[y.nivel] || (y.valor ?? 0) - (x.valor ?? 0));

  // ---- Briefing -------------------------------------------------------------
  const primeiro = (n: Nivel) => alertas.find((al) => al.nivel === n)?.detalhe ?? null;
  const vitoria =
    primeiro('verde') ??
    (pageviewsHoje > 0
      ? `Dia rodando: ${visitantesHoje.size} pessoa(s) já visitaram a loja hoje.`
      : null);
  const atencao = primeiro('amarelo');
  const acao =
    primeiro('vermelho') ??
    primeiro('amarelo') ??
    'Compartilhe a vitrine no seu story hoje — tráfego novo é venda nova.';

  // ---- Prova de valor (língua do Marcelo) -----------------------------------
  const provaDeValor =
    contatosSemana > 0
      ? `Essa semana o site trouxe ${visitantesSemana.size} visitante(s) e ${contatosSemana} contato(s) direto no seu WhatsApp.`
      : `Essa semana ${visitantesSemana.size} pessoa(s) passaram pela sua vitrine${retornosSemana > 0 ? ` e ${retornosSemana} voltaram pra olhar de novo` : ''}. O site está trabalhando pra você.`;

  // ---- Leads quentes --------------------------------------------------------
  const leadsQuentes: Lead[] = sig
    .filter((s) => s.tipo === 'whatsapp_click')
    .sort((x, y) => ts(y.criado_em) - ts(x.criado_em))
    .slice(0, 10)
    .map((s) => ({
      veiculo_id: s.veiculo_id,
      titulo: s.veiculo_id ? byId.get(s.veiculo_id)?.titulo ?? null : null,
      quandoISO: new Date(ts(s.criado_em)).toISOString(),
      foraDoExpediente: foraExpediente(brHour(ts(s.criado_em))),
    }));

  return {
    geradoEmISO: new Date(now).toISOString(),
    foraDoExpedienteAgora: foraAgora,
    hoje: {
      visitantes: visitantesHoje.size,
      pageviews: pageviewsHoje,
      carrosVistos: carrosVistosHoje.size,
      contatos: contatosHoje,
      valorVitrine,
    },
    semana: {
      visitantes: visitantesSemana.size,
      carrosVistos: carrosVistosSemana.size,
      contatos: contatosSemana,
      retornos: retornosSemana,
    },
    provaDeValor,
    briefing: { vitoria, atencao, acao },
    alertas,
    carros,
    leadsQuentes,
  };
}
