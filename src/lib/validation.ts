import { z } from 'zod';
import { VEHICLE_CATEGORIES } from './constants';

/**
 * Schemas de validação com Zod
 * Usados em react-hook-form + API routes
 */

// Validação de Veículo (criação/edição)
export const VehicleSchema = z.object({
  titulo: z
    .string()
    .min(5, 'Título deve ter no mínimo 5 caracteres')
    .max(100, 'Título máximo 100 caracteres')
    .trim(),

  // 0 = "sob consulta" (valor combinado no WhatsApp)
  preco: z
    .number()
    .min(0, 'Preço inválido')
    .max(1000000, 'Preço máximo R$ 1.000.000'),

  categoria: z
    .enum(['venda', 'aluguel', 'ambos'] as const)
    .default('venda'),

  descricao: z
    .string()
    .max(500, 'Descrição máximo 500 caracteres')
    .optional()
    .default(''),

  fotos: z
    .array(z.string().url())
    .max(10, 'Máximo 10 fotos por veículo')
    .default([]),

  status: z
    .enum(['disponivel', 'vendido'] as const)
    .default('disponivel'),

  // Vídeo opcional (YouTube ou mp4) — vazio = sem vídeo
  video_url: z
    .string()
    .url('Link de vídeo inválido')
    .optional()
    .or(z.literal('')),
});

export type VehicleFormInput = z.infer<typeof VehicleSchema>;

// Validação de Upload de Imagem
export const ImageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.type.startsWith('image/'), 'Apenas imagens são permitidas')
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Imagem máximo 10MB'),
});

// Validação de Filtros (página pública)
export const FilterSchema = z.object({
  categoria: z.enum(['todos', 'venda', 'aluguel']).default('todos'),
  status: z.enum(['disponivel', 'vendido']).default('disponivel'),
  search: z.string().optional(),
});

export type FilterInput = z.infer<typeof FilterSchema>;

// Validação de autenticação (login admin)
export const AdminLoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha mínimo 6 caracteres'),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
