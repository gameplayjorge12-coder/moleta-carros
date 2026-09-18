import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * Testes de INTERAÇÃO REAL do admin, contra o site deployado (baseURL).
 * Exercitam a mesma API que o painel usa: criar, editar, capa, vender, deletar,
 * limpeza de storage, gates de auth e regressão de schema.
 *
 * ⚠️ SEGURANÇA DE PRODUÇÃO: o DELETE limpa o Storage dos objetos referenciados.
 * Por isso NUNCA usamos caminho de foto REAL — só paths inexistentes no bucket
 * (remover inexistente é no-op). Assim os testes jamais apagam foto de carro real.
 */

const ADMIN_PASS =
  process.env.E2E_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123';

const BUCKET = 'https://npxqnedaaeuzitdiqgvd.supabase.co/storage/v1/object/public/veiculos';
// Caminhos propositalmente inexistentes → seguros para o cleanup do delete.
const FAKE_A = `${BUCKET}/zz_qa_inexistente_a.jpg`;
const FAKE_B = `${BUCKET}/zz_qa_inexistente_b.jpg`;
const FAKE_UUID = '00000000-0000-4000-8000-000000000000';

async function login(request: APIRequestContext) {
  const r = await request.post('/api/admin/login', { data: { password: ADMIN_PASS } });
  expect(r.ok(), 'login deve funcionar (confira E2E_ADMIN_PASSWORD)').toBeTruthy();
}

async function createVehicle(
  request: APIRequestContext,
  over: Record<string, unknown> = {}
): Promise<string> {
  const r = await request.post('/api/admin/vehicles', {
    data: {
      titulo: 'ZZ_QA_base_delete',
      preco: 0,
      categoria: 'venda',
      descricao: 'qa',
      fotos: [FAKE_A],
      status: 'disponivel',
      video_url: '',
      ...over,
    },
  });
  expect(r.ok(), 'create deve funcionar').toBeTruthy();
  const { id } = await r.json();
  expect(id).toBeTruthy();
  return id as string;
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIÇÃO (a feature nova)
// ─────────────────────────────────────────────────────────────────────────────

test('edição: altera todos os campos e persiste (GET confirma)', async ({ request }) => {
  await login(request);
  const id = await createVehicle(request, {
    titulo: 'ZZ_QA_EDIT_antes',
    fotos: [FAKE_A, FAKE_B],
  });
  try {
    const put = await request.put(`/api/admin/vehicles/${id}`, {
      data: {
        titulo: 'ZZ_QA_EDIT_depois',
        preco: 75000,
        categoria: 'ambos',
        descricao: 'descrição editada',
        fotos: [FAKE_B, FAKE_A], // capa trocada (B vira a primeira)
        status: 'vendido',
        video_url: 'https://www.youtube.com/watch?v=Y-LQZ0G7R_M',
      },
    });
    expect(put.ok()).toBeTruthy();

    const get = await request.get(`/api/admin/vehicles/${id}`);
    expect(get.ok()).toBeTruthy();
    const { veiculo } = await get.json();
    expect(veiculo.titulo).toBe('ZZ_QA_EDIT_depois');
    expect(Number(veiculo.preco)).toBe(75000);
    expect(veiculo.categoria).toBe('ambos');
    expect(veiculo.descricao).toBe('descrição editada');
    expect(veiculo.status).toBe('vendido');
    expect(veiculo.fotos[0]).toBe(FAKE_B); // capa reordenada persistiu
    expect(veiculo.video_url).toContain('youtube');
  } finally {
    await request.delete(`/api/admin/vehicles/${id}`);
  }
});

test('edição: definir foto de capa reordena a lista', async ({ request }) => {
  await login(request);
  const id = await createVehicle(request, { fotos: [FAKE_A, FAKE_B] });
  try {
    // capa atual = A. Troca para B na frente.
    await request.put(`/api/admin/vehicles/${id}`, {
      data: {
        titulo: 'ZZ_QA_capa',
        preco: 0,
        categoria: 'venda',
        descricao: '',
        fotos: [FAKE_B, FAKE_A],
        status: 'disponivel',
        video_url: '',
      },
    });
    const { veiculo } = await (await request.get(`/api/admin/vehicles/${id}`)).json();
    expect(veiculo.fotos).toEqual([FAKE_B, FAKE_A]);
  } finally {
    await request.delete(`/api/admin/vehicles/${id}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPORTAMENTO PÚBLICO REAL (vitrine)
// ─────────────────────────────────────────────────────────────────────────────

test('vitrine: carro disponível aparece; ao editar título some o antigo e entra o novo', async ({ request }) => {
  await login(request);
  const antes = `ZZ_QA_VITRINE_${Date.now()}_antes`;
  const depois = `ZZ_QA_VITRINE_${Date.now()}_depois`;
  const id = await createVehicle(request, { titulo: antes });
  try {
    let home = await (await request.get('/')).text();
    expect(home).toContain(antes);

    await request.put(`/api/admin/vehicles/${id}`, {
      data: {
        titulo: depois,
        preco: 0,
        categoria: 'venda',
        descricao: '',
        fotos: [FAKE_A],
        status: 'disponivel',
        video_url: '',
      },
    });

    home = await (await request.get('/')).text();
    expect(home).toContain(depois);
    expect(home).not.toContain(antes);
  } finally {
    await request.delete(`/api/admin/vehicles/${id}`);
  }
});

test('vitrine: carro marcado como vendido some da página pública', async ({ request }) => {
  await login(request);
  const marker = `ZZ_QA_VENDIDO_${Date.now()}`;
  const id = await createVehicle(request, { titulo: marker });
  try {
    let home = await (await request.get('/')).text();
    expect(home).toContain(marker);

    const patch = await request.patch(`/api/admin/vehicles/${id}`, {
      data: { status: 'vendido' },
    });
    expect(patch.ok()).toBeTruthy();

    home = await (await request.get('/')).text();
    expect(home).not.toContain(marker);
  } finally {
    await request.delete(`/api/admin/vehicles/${id}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SEGURANÇA / AUTH
// ─────────────────────────────────────────────────────────────────────────────

test('segurança: TODAS as rotas de escrita/leitura admin exigem login (401)', async ({ request }) => {
  // request "fresco" sem cookie de login
  const casos: Array<[string, string, any]> = [
    ['post', '/api/admin/vehicles', { data: { titulo: 'x', preco: 0, categoria: 'venda', fotos: [], status: 'disponivel' } }],
    ['get', `/api/admin/vehicles/${FAKE_UUID}`, {}],
    ['put', `/api/admin/vehicles/${FAKE_UUID}`, { data: {} }],
    ['patch', `/api/admin/vehicles/${FAKE_UUID}`, { data: { status: 'vendido' } }],
    ['delete', `/api/admin/vehicles/${FAKE_UUID}`, {}],
    ['post', '/api/admin/upload', {}],
    ['post', '/api/admin/video-upload-url', { data: { filename: 'x.mp4' } }],
  ];
  for (const [method, url, opts] of casos) {
    const res = await (request as any)[method](url, opts);
    expect(res.status(), `${method.toUpperCase()} ${url} sem login`).toBe(401);
  }
});

test('segurança: senha errada não autentica (401)', async ({ request }) => {
  const r = await request.post('/api/admin/login', { data: { password: 'senha_errada_xyz' } });
  expect(r.status()).toBe(401);
});

// ─────────────────────────────────────────────────────────────────────────────
// ROBUSTEZ / CONTRATO
// ─────────────────────────────────────────────────────────────────────────────

test('robustez: PUT com título curto → 400 (validação Zod)', async ({ request }) => {
  await login(request);
  const id = await createVehicle(request);
  try {
    const r = await request.put(`/api/admin/vehicles/${id}`, {
      data: { titulo: 'AB', preco: 0, categoria: 'venda', fotos: [FAKE_A], status: 'disponivel' },
    });
    expect(r.status()).toBe(400);
  } finally {
    await request.delete(`/api/admin/vehicles/${id}`);
  }
});

test('robustez: PUT em uuid inexistente → 404', async ({ request }) => {
  await login(request);
  const r = await request.put(`/api/admin/vehicles/${FAKE_UUID}`, {
    data: {
      titulo: 'ZZ_QA_valido_mas_inexistente',
      preco: 0,
      categoria: 'venda',
      descricao: '',
      fotos: [FAKE_A],
      status: 'disponivel',
      video_url: '',
    },
  });
  expect(r.status()).toBe(404);
});

test('robustez: id não-UUID → 400 em GET/PUT/PATCH/DELETE', async ({ request }) => {
  await login(request);
  const methods: Array<'get' | 'put' | 'patch' | 'delete'> = ['get', 'put', 'patch', 'delete'];
  for (const m of methods) {
    const opts = m === 'get' || m === 'delete' ? {} : { data: {} };
    const res = await (request as any)[m]('/api/admin/vehicles/nao-e-uuid', opts);
    expect(res.status(), `${m} id inválido`).toBe(400);
  }
});

test('robustez: PATCH sem campo válido → 400 ("nada para atualizar")', async ({ request }) => {
  await login(request);
  const id = await createVehicle(request);
  try {
    const r = await request.patch(`/api/admin/vehicles/${id}`, { data: { foo: 'bar' } });
    expect(r.status()).toBe(400);
  } finally {
    await request.delete(`/api/admin/vehicles/${id}`);
  }
});

test('robustez: body não-JSON no PUT → 400, nunca 500', async ({ request }) => {
  await login(request);
  const id = await createVehicle(request);
  try {
    const r = await request.put(`/api/admin/vehicles/${id}`, {
      headers: { 'content-type': 'application/json' },
      data: 'isto nao e json {',
    });
    expect(r.status()).toBe(400);
  } finally {
    await request.delete(`/api/admin/vehicles/${id}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSÃO DE SCHEMA (a classe que causou o drift)
// ─────────────────────────────────────────────────────────────────────────────

test('schema: cadastro categoria=ambos + video_url funciona (guard anti-drift)', async ({ request }) => {
  await login(request);
  const create = await request.post('/api/admin/vehicles', {
    data: {
      titulo: 'ZZ_QA_AMBOS_VIDEO',
      preco: 50000,
      categoria: 'ambos',
      descricao: '',
      fotos: [FAKE_A],
      status: 'disponivel',
      video_url: 'https://www.youtube.com/watch?v=Y-LQZ0G7R_M',
    },
  });
  expect(create.ok(), 'ambos + video_url deve inserir (senão o schema regrediu)').toBeTruthy();
  const { id } = await create.json();
  try {
    const { veiculo } = await (await request.get(`/api/admin/vehicles/${id}`)).json();
    expect(veiculo.categoria).toBe('ambos');
    expect(veiculo.video_url).toContain('youtube');
  } finally {
    await request.delete(`/api/admin/vehicles/${id}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CLEANUP DE STORAGE
// ─────────────────────────────────────────────────────────────────────────────

test('delete: responde storage_removidos (cleanup best-effort não quebra o delete)', async ({ request }) => {
  await login(request);
  const id = await createVehicle(request, { fotos: [FAKE_A, FAKE_B] });
  const del = await request.delete(`/api/admin/vehicles/${id}`);
  expect(del.ok()).toBeTruthy();
  const j = await del.json();
  expect(j.ok).toBe(true);
  expect(typeof j.storage_removidos).toBe('number');
  expect(j.deletados).toBe(1);
});
