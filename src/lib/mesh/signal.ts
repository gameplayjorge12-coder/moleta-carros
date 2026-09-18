/**
 * MALHA — Contrato do sinal cru (Camada 2/3).
 * Valida o payload que chega em /api/track antes de gravar em mesh_sinal.
 * Payload ruim é rejeitado (não contamina a fonte da verdade).
 */
import { z } from 'zod';

export const TIPOS_SINAL = [
  'page_view',
  'car_detail_view',
  'gallery_open',
  'video_play',
  'filter_use',
  'whatsapp_click',
] as const;

export const SignalSchema = z.object({
  site: z.string().min(1).max(40),
  tipo: z.enum(TIPOS_SINAL),
  device_fp: z.string().min(4).max(64).optional(),
  veiculo_id: z.string().uuid().optional(),
  referrer: z.string().max(2048).optional(),
  utm: z.record(z.string()).optional(),
  payload: z.record(z.any()).optional(),
});

export type Signal = z.infer<typeof SignalSchema>;

export function validateSignal(input: unknown) {
  return SignalSchema.safeParse(input);
}
