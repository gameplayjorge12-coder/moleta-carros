import { test, expect } from '@playwright/test';

// ⚠️ Caminho INEXISTENTE de propósito: o DELETE limpa o Storage dos objetos do
// veículo. Usar uma foto REAL aqui apagaria a imagem do carro real em produção.
const IMG =
  'https://npxqnedaaeuzitdiqgvd.supabase.co/storage/v1/object/public/veiculos/zz_qa_inexistente_workflow.jpg';

// Senha do ambiente — nunca hardcoded (quebra quando a senha real muda).
const ADMIN_PASS =
  process.env.E2E_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123';

// Simula o dia-a-dia do Marcelo pela mesma API que o painel usa.
test('workflow admin: criar → vender → vídeo → deletar', async ({ request }) => {
  const login = await request.post('/api/admin/login', {
    data: { password: ADMIN_PASS },
  });
  expect(login.ok()).toBeTruthy();

  // 1. cadastrar carro
  const create = await request.post('/api/admin/vehicles', {
    data: {
      titulo: 'ZZ TESTE WORKFLOW QA',
      preco: 0,
      categoria: 'venda',
      descricao: 'carro de teste automatizado',
      fotos: [IMG],
      status: 'disponivel',
      video_url: '',
    },
  });
  expect(create.ok()).toBeTruthy();
  const { id } = await create.json();
  expect(id).toBeTruthy();

  // 2. marcar como vendido
  const sold = await request.patch(`/api/admin/vehicles/${id}`, {
    data: { status: 'vendido' },
  });
  expect(sold.ok()).toBeTruthy();

  // 3. anexar vídeo
  const vid = await request.patch(`/api/admin/vehicles/${id}`, {
    data: { video_url: 'https://www.youtube.com/watch?v=Y-LQZ0G7R_M' },
  });
  expect(vid.ok()).toBeTruthy();

  // 4. deletar (limpa o teste)
  const del = await request.delete(`/api/admin/vehicles/${id}`);
  expect(del.ok()).toBeTruthy();
});

test('workflow admin: cadastro inválido é rejeitado (título curto)', async ({ request }) => {
  await request.post('/api/admin/login', { data: { password: ADMIN_PASS } });
  const bad = await request.post('/api/admin/vehicles', {
    data: { titulo: 'AB', preco: 0, categoria: 'venda', fotos: [IMG], status: 'disponivel' },
  });
  expect(bad.status()).toBe(400);
});

test('segurança: pedir URL de upload de vídeo sem login = 401', async ({ request }) => {
  const res = await request.post('/api/admin/video-upload-url', {
    data: { filename: 'x.mp4' },
  });
  expect(res.status()).toBe(401);
});
