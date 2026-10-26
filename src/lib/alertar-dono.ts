// Catraca estendida (26/10): todo job CRÍTICO avisa o dono na FALHA — nunca morre em silêncio.
// Classe descoberta no EIXO: "parece resiliente, falha calado". Dependency-free (fetch Resend);
// sem RESEND_API_KEY → degrada pra console.error (nunca quebra o job). Portável entre projetos.
export async function alertarDono(assunto: string, detalhe: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERTA_EMAIL || 'gameplayjorge12@gmail.com';
  const from = process.env.RESEND_FROM_EMAIL || 'Moleta Veiculos <nao-responda@iafirst.trade>';
  if (!key) { console.error(`[alertar-dono] SEM RESEND_API_KEY — alerta NÃO enviado: ${assunto}`); return; }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject: `🚨 ${assunto}`, text: detalhe }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error(`[alertar-dono] Resend ${res.status} — ${assunto}`);
  } catch (e) {
    console.error(`[alertar-dono] falha ao enviar: ${(e as Error).message}`);
  }
}
