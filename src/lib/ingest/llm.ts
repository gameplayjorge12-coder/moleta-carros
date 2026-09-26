/**
 * Cliente LLM mínimo por fetch (sem SDK novo no bundle). Lê a chave do ambiente:
 * Anthropic (preferido) ou OpenAI. Devolve texto — o parser vive em extract.ts.
 * Mantido fininho de propósito: a lógica de negócio não conhece o provedor.
 */
import type { Complete } from './extract';

export function llmFromEnv(): Complete | null {
  const anthropic = process.env.ANTHROPIC_API_KEY;
  const openai = process.env.OPENAI_API_KEY;

  if (anthropic) {
    return async (prompt: string) => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropic,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.INGEST_LLM_MODEL || 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`);
      const j = (await res.json()) as { content?: Array<{ text?: string }> };
      return j.content?.map((c) => c.text ?? '').join('') ?? '';
    };
  }

  if (openai) {
    return async (prompt: string) => {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${openai}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: process.env.INGEST_LLM_MODEL || 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        }),
      });
      if (!res.ok) throw new Error(`openai ${res.status}: ${await res.text()}`);
      const j = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return j.choices?.[0]?.message?.content ?? '';
    };
  }

  return null;
}
