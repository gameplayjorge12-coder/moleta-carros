/**
 * Constantes e configuração global
 */

// Supabase
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Moleta
export const MARCELO_PHONE = '5585987654321'; // Número WhatsApp Marcelo
export const COMPANY_NAME = 'Moleta Carros';
export const COMPANY_LOCATION = 'Uraí, PR';

// Design System — Paleta Laranja
export const COLORS = {
  PRIMARY: '#FF6B35',       // Laranja (CTA, urgência)
  PRIMARY_DARK: '#ff5a1f',  // Hover state
  SECONDARY: '#1e40af',     // Azul (headers, confiança)
  SUCCESS: '#10b981',       // Verde (disponível)
  DANGER: '#ef4444',        // Vermelho (vendido)
  GRAY_LIGHT: '#f3f4f6',    // Fundo
  GRAY_DARK: '#374151',     // Texto
  BLACK: '#000000',
  WHITE: '#ffffff',
};

// Categorias de veículos
export const VEHICLE_CATEGORIES = {
  VENDA: 'venda',
  ALUGUEL: 'aluguel',
} as const;

export const CATEGORY_LABELS = {
  venda: 'Venda',
  aluguel: 'Locadora (4)',
} as const;

// Status
export const VEHICLE_STATUS = {
  DISPONIVEL: 'disponivel',
  VENDIDO: 'vendido',
} as const;

// Ambiente
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// URLs de storage
export const STORAGE_BUCKET = 'veiculos';
export const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}`;

// Timeouts
export const API_TIMEOUT = 5000; // 5 segundos
export const IMAGE_UPLOAD_MAX_SIZE = 10 * 1024 * 1024; // 10 MB
export const IMAGE_COMPRESS_MAX_SIZE = 200 * 1024; // 200 KB comprimido

// Limites
export const MAX_IMAGES_PER_VEHICLE = 10;
export const MAX_VEHICLES_PER_PAGE = 20;

// Animações
export const ANIMATION_TIMING = {
  FAST: 150,     // ms
  NORMAL: 250,   // ms
  SLOW: 400,     // ms
} as const;
