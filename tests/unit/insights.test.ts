import { describe, it, expect } from 'vitest';
import { computeInsights, type SinalRow, type VeiculoRow } from '@/lib/insights';

// Relógio fixo: 2026-09-20 12:00 BR (= 15:00 UTC). Todos os casos ancoram aqui.
const NOW = new Date('2026-09-20T15:00:00.000Z');
const HOJE_UTC = (hhmm: string) => `2026-09-20T${hhmm}:00.000Z`;
const diasAtras = (d: number, hhmm = '15:00') =>
  new Date(NOW.getTime() - d * 86400000).toISOString().slice(0, 11) + hhmm + ':00.000Z';

// pick respeita null EXPLÍCITO (só usa o default quando a chave está ausente).
const pick = <T,>(over: Record<string, any>, key: string, def: T): T =>
  key in over ? over[key] : def;
function carro(over: Partial<VeiculoRow> = {}): VeiculoRow {
  return {
    id: pick(over, 'id', 'car-1'),
    titulo: pick(over, 'titulo', 'Toyota Corolla 2019'),
    preco: pick(over, 'preco', 80000),
    status: pick(over, 'status', 'disponivel'),
    fotos: pick(over, 'fotos', ['a.jpg', 'b.jpg']),
    created_at: pick(over, 'created_at', diasAtras(2)),
    categoria: pick(over, 'categoria', 'venda'),
  };
}
function sinal(tipo: string, over: Partial<SinalRow> = {}): SinalRow {
  return {
    tipo,
    veiculo_id: over.veiculo_id ?? null,
    device_fp: over.device_fp ?? 'dev-x',
    criado_em: over.criado_em ?? HOJE_UTC('14:00'),
  };
}

describe('computeInsights — robustez', () => {
  it('1. dados vazios não crasham e voltam zeros coerentes', () => {
    const r = computeInsights([], [], NOW);
    expect(r.hoje.visitantes).toBe(0);
    expect(r.hoje.valorVitrine).toBe(0);
    expect(r.carros).toEqual([]);
    expect(r.leadsQuentes).toEqual([]);
    expect(typeof r.briefing.acao).toBe('string'); // sempre dá uma ação
  });

  it('2. campos null (preço/título/fotos) não crasham', () => {
    const v = carro({ preco: null, titulo: null, fotos: null });
    const r = computeInsights([], [v], NOW);
    expect(r.carros[0].preco).toBe(0);
    expect(r.carros[0].titulo).toBe('Veículo');
    // fotos null => sem foto => alerta vermelho
    expect(r.alertas.some((a) => a.nivel === 'vermelho' && /sem foto/i.test(a.titulo))).toBe(true);
  });

  it('11. sinais de teste (TESTFP_) são ignorados', () => {
    const sigs = [
      sinal('page_view', { device_fp: 'TESTFP_probe' }),
      sinal('page_view', { device_fp: 'real-1' }),
    ];
    const r = computeInsights(sigs, [], NOW);
    expect(r.hoje.visitantes).toBe(1);
    expect(r.hoje.pageviews).toBe(1);
  });
});

describe('computeInsights — fronteira de dia BR [GB-03]', () => {
  it('3. sinal às 02:00 UTC conta como ONTEM no fuso BR', () => {
    const sigs = [
      sinal('page_view', { device_fp: 'd1', criado_em: HOJE_UTC('02:00') }), // 23:00 BR de ontem
      sinal('page_view', { device_fp: 'd2', criado_em: HOJE_UTC('14:00') }), // hoje BR
    ];
    const r = computeInsights(sigs, [], NOW);
    expect(r.hoje.pageviews).toBe(1); // só o das 14:00 UTC
    expect(r.semana.visitantes).toBe(2); // ambos entram na semana
  });
});

describe('computeInsights — semáforo', () => {
  it('4. pico de desejo hoje => alerta verde', () => {
    const v = carro({ id: 'c1' });
    const sigs = Array.from({ length: 4 }, (_, i) =>
      sinal('car_detail_view', { veiculo_id: 'c1', device_fp: `d${i}`, criado_em: HOJE_UTC(`1${i}:00`) })
    );
    const r = computeInsights(sigs, [v], NOW);
    expect(r.alertas.some((a) => a.nivel === 'verde' && /bombando/i.test(a.titulo))).toBe(true);
  });

  it('5. interesse parado => amarelo com valor = preço', () => {
    const v = carro({ id: 'c2', preco: 90000 });
    // 5 views espalhadas (2/dia em dias diferentes, nada suficiente pra spike hoje), 0 contato
    const sigs = [
      sinal('car_detail_view', { veiculo_id: 'c2', device_fp: 'a', criado_em: diasAtras(1) }),
      sinal('car_detail_view', { veiculo_id: 'c2', device_fp: 'b', criado_em: diasAtras(2) }),
      sinal('car_detail_view', { veiculo_id: 'c2', device_fp: 'c', criado_em: diasAtras(3) }),
      sinal('car_detail_view', { veiculo_id: 'c2', device_fp: 'd', criado_em: diasAtras(3) }),
      sinal('car_detail_view', { veiculo_id: 'c2', device_fp: 'e', criado_em: diasAtras(4) }),
    ];
    const r = computeInsights(sigs, [v], NOW);
    const al = r.alertas.find((a) => a.nivel === 'amarelo' && /interesse parado/i.test(a.titulo));
    expect(al).toBeTruthy();
    expect(al!.valor).toBe(90000);
  });

  it('6. invisível (7+ dias, 0 views) => vermelho', () => {
    const v = carro({ id: 'c3', created_at: diasAtras(10) });
    const r = computeInsights([], [v], NOW);
    expect(r.alertas.some((a) => a.nivel === 'vermelho' && /invisível/i.test(a.titulo))).toBe(true);
  });

  it('7. sem foto tem precedência sobre invisível', () => {
    const v = carro({ id: 'c4', created_at: diasAtras(10), fotos: [] });
    const r = computeInsights([], [v], NOW);
    const verm = r.alertas.filter((a) => a.veiculo_id === 'c4' && a.nivel === 'vermelho');
    expect(verm).toHaveLength(1);
    expect(verm[0].titulo).toMatch(/sem foto/i);
  });

  it('8. lead quente (24h) => verde + entra em leadsQuentes + conta contato', () => {
    const v = carro({ id: 'c5', titulo: 'Fiat Strada' });
    const sigs = [sinal('whatsapp_click', { veiculo_id: 'c5', criado_em: HOJE_UTC('13:00') })];
    const r = computeInsights(sigs, [v], NOW);
    expect(r.alertas.some((a) => a.nivel === 'verde' && a.veiculo_id === 'c5')).toBe(true);
    expect(r.hoje.contatos).toBe(1);
    expect(r.leadsQuentes[0].titulo).toBe('Fiat Strada');
  });

  it('12. carro VENDIDO não gera alerta de problema', () => {
    const v = carro({ id: 'c6', status: 'vendido', created_at: diasAtras(30), fotos: [] });
    const r = computeInsights([], [v], NOW);
    expect(r.alertas.some((a) => a.veiculo_id === 'c6' && a.nivel === 'vermelho')).toBe(false);
  });
});

describe('computeInsights — termômetro e financeiro', () => {
  it('9. score normaliza 0-100 e ordena do mais quente ao mais frio', () => {
    const quente = carro({ id: 'hot' });
    const morno = carro({ id: 'warm' });
    const frio = carro({ id: 'cold' });
    const sigs = [
      ...Array.from({ length: 6 }, (_, i) =>
        sinal('car_detail_view', { veiculo_id: 'hot', device_fp: `h${i}`, criado_em: diasAtras(1) })
      ),
      ...Array.from({ length: 2 }, (_, i) =>
        sinal('car_detail_view', { veiculo_id: 'warm', device_fp: `w${i}`, criado_em: diasAtras(1) })
      ),
    ];
    const r = computeInsights(sigs, [quente, morno, frio], NOW);
    expect(r.carros[0].id).toBe('hot');
    expect(r.carros[0].score).toBe(100);
    expect(r.carros.find((c) => c.id === 'cold')!.score).toBe(0);
    r.carros.forEach((c) => {
      expect(c.score).toBeGreaterThanOrEqual(0);
      expect(c.score).toBeLessThanOrEqual(100);
    });
  });

  it('10. valorVitrine soma preço dos carros vistos hoje, sem dupla contagem', () => {
    const a = carro({ id: 'a', preco: 50000 });
    const b = carro({ id: 'b', preco: 30000 });
    const sigs = [
      sinal('car_detail_view', { veiculo_id: 'a', device_fp: 'd1', criado_em: HOJE_UTC('10:00') }),
      sinal('car_detail_view', { veiculo_id: 'a', device_fp: 'd2', criado_em: HOJE_UTC('11:00') }), // mesmo carro
      sinal('car_detail_view', { veiculo_id: 'b', device_fp: 'd3', criado_em: HOJE_UTC('12:00') }),
    ];
    const r = computeInsights(sigs, [a, b], NOW);
    expect(r.hoje.valorVitrine).toBe(80000); // 50k + 30k (a contado 1x)
    expect(r.hoje.carrosVistos).toBe(2);
  });
});

describe('computeInsights — cotidiano humano', () => {
  it('13. mesma pessoa que VOLTOU (namoro) => verde + retorno contado', () => {
    const v = carro({ id: 'n1', titulo: 'Honda Civic' });
    // MESMO device vê o carro em 3 dias diferentes = namoro
    const sigs = [
      sinal('car_detail_view', { veiculo_id: 'n1', device_fp: 'namorado', criado_em: diasAtras(2) }),
      sinal('car_detail_view', { veiculo_id: 'n1', device_fp: 'namorado', criado_em: diasAtras(1) }),
      sinal('car_detail_view', { veiculo_id: 'n1', device_fp: 'namorado', criado_em: HOJE_UTC('10:00') }),
    ];
    const r = computeInsights(sigs, [v], NOW);
    expect(r.alertas.some((a) => a.nivel === 'verde' && /namorando/i.test(a.titulo))).toBe(true);
    expect(r.carros[0].retornos).toBe(1);
    expect(r.carros[0].visitantesUnicos).toBe(1);
  });

  it('14. madrugada NÃO conta como pico (bot não é interesse)', () => {
    const v = carro({ id: 'm1' });
    // 4 views às 3h da manhã BR (06:00 UTC), pessoas distintas
    const sigs = Array.from({ length: 4 }, (_, i) =>
      sinal('car_detail_view', { veiculo_id: 'm1', device_fp: `bot${i}`, criado_em: HOJE_UTC('06:0' + i) })
    );
    const r = computeInsights(sigs, [v], NOW);
    expect(r.alertas.some((a) => /bombando/i.test(a.titulo))).toBe(false);
  });

  it('15. o Marcelo dorme: lead à noite => "responda de manhã" + foraDoExpediente', () => {
    const NOITE = new Date('2026-09-20T23:30:00.000Z'); // 20:30 BR
    const v = carro({ id: 's1', titulo: 'Jeep Compass' });
    const sigs = [sinal('whatsapp_click', { veiculo_id: 's1', criado_em: '2026-09-20T23:00:00.000Z' })];
    const r = computeInsights(sigs, [v], NOITE);
    const lead = r.alertas.find((a) => a.nivel === 'verde' && a.veiculo_id === 's1');
    expect(lead).toBeTruthy();
    expect(/manhã|abrir/i.test(lead!.detalhe)).toBe(true);
    expect(r.foraDoExpedienteAgora).toBe(true);
    expect(r.leadsQuentes[0].foraDoExpediente).toBe(true);
  });

  it('16. silêncio só alarma depois do horário de movimento (não de manhã cedo)', () => {
    const MANHA = new Date('2026-09-20T12:00:00.000Z'); // 09:00 BR
    const rManha = computeInsights([], [], MANHA);
    expect(rManha.alertas.some((a) => /sem visitas/i.test(a.titulo))).toBe(false);
    // à tarde (12:00 BR) com 0 visita, aí sim alarma
    const rTarde = computeInsights([], [], NOW);
    expect(rTarde.alertas.some((a) => /sem visitas/i.test(a.titulo))).toBe(true);
  });

  it('17. carro velho + com movimento => nudge "ainda disponível?" (drift offline)', () => {
    const v = carro({ id: 'd1', created_at: diasAtras(20) });
    const sigs = [
      sinal('car_detail_view', { veiculo_id: 'd1', device_fp: 'p1', criado_em: diasAtras(1) }),
      sinal('car_detail_view', { veiculo_id: 'd1', device_fp: 'p2', criado_em: diasAtras(2) }),
      sinal('car_detail_view', { veiculo_id: 'd1', device_fp: 'p3', criado_em: diasAtras(3) }),
    ];
    const r = computeInsights(sigs, [v], NOW);
    const al = r.alertas.find((a) => a.nivel === 'amarelo' && /disponível/i.test(a.titulo));
    expect(al).toBeTruthy();
    // não pode ser marcado invisível (tem views) nem gerar 2 amarelos no mesmo carro
    expect(r.alertas.filter((a) => a.veiculo_id === 'd1' && a.nivel === 'vermelho')).toHaveLength(0);
  });
});
