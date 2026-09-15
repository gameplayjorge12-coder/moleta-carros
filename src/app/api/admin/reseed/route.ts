import { NextResponse } from 'next/server';
import { pgClient } from '@/lib/adminDb';

export const dynamic = 'force-dynamic';

const IMG = 'https://npxqnedaaeuzitdiqgvd.supabase.co/storage/v1/object/public/veiculos';

// Catálogo REAL (identificado nas fotos). preco=0 => "sob consulta" (valor no WhatsApp).
const CARROS = [
  { titulo: 'Toyota RAV4 Prata', categoria: 'venda', descricao: 'SUV Toyota RAV4 prata, robusto e confortável. Valores e detalhes no WhatsApp.', fotos: ['rav4-1.jpg','rav4-2.jpg','rav4-3.jpg','rav4-4.jpg'] },
  { titulo: 'Toyota Corolla Preto', categoria: 'venda', descricao: 'Toyota Corolla preto, sedã de conforto e confiabilidade. Detalhes no WhatsApp.', fotos: ['corolla-1.jpg','corolla-2.jpg','corolla-3.jpg'] },
  { titulo: 'Fiat Palio Weekend Trekking Preto', categoria: 'venda', descricao: 'Fiat Palio Weekend Trekking preta, espaçosa e versátil. Detalhes no WhatsApp.', fotos: ['palio-1.jpg','palio-2.jpg','palio-3.jpg','palio-4.jpg','palio-5.jpg'] },
  { titulo: 'Fiat Strada Branca', categoria: 'venda', descricao: 'Fiat Strada branca, picape para trabalho e lazer. Detalhes no WhatsApp.', fotos: ['strada-1.jpg','strada-2.jpg','strada-3.jpg'] },
  { titulo: 'Caminhão Carroceria Branco', categoria: 'venda', descricao: 'Caminhão com carroceria de madeira, branco. Detalhes no WhatsApp.', fotos: ['caminhao-1.jpg','caminhao-2.jpg','caminhao-3.jpg'] },
  { titulo: 'Fiat Mobi Prata', categoria: 'aluguel', descricao: 'Fiat Mobi prata, econômico e com baixa quilometragem. Ideal para locação. Detalhes no WhatsApp.', fotos: ['mobi-1.jpg','mobi-2.jpg','mobi-3.jpg','mobi-4.jpg','mobi-5.jpg'] },
  { titulo: 'Renault Kwid Branco', categoria: 'aluguel', descricao: 'Renault Kwid branco, econômico e ágil. Ideal para locação. Detalhes no WhatsApp.', fotos: ['kwid-1.jpg','kwid-2.jpg','kwid-3.jpg','kwid-4.jpg','kwid-5.jpg'] },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('token') !== 'moleta-reseed-3v9k') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const client = pgClient();
  try {
    await client.connect();
    await client.query('DELETE FROM public.veiculos');

    let n = 0;
    for (const c of CARROS) {
      const fotos = c.fotos.map((f) => `${IMG}/${f}`);
      await client.query(
        `INSERT INTO public.veiculos (titulo, preco, categoria, descricao, fotos, status)
         VALUES ($1, 0, $2, $3, $4, 'disponivel')`,
        [c.titulo, c.categoria, c.descricao, fotos]
      );
      n++;
    }

    const after = await client.query(
      'SELECT titulo, categoria, array_length(fotos,1) AS n_fotos FROM public.veiculos ORDER BY created_at'
    );
    await client.end();
    return NextResponse.json({ ok: true, inseridos: n, catalogo: after.rows });
  } catch (e: any) {
    try { await client.end(); } catch {}
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
