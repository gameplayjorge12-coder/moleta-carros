/**
 * Constantes e configuração global
 */

// Supabase
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Moleta — WhatsApp Marcelo. Padrão BR celular = 13 dígitos (55 + DDD + 9 dígitos).
// Corrigido com o 9º dígito. ⚠️ CONFIRMAR clicando no botão que chega no Marcelo.
export const MARCELO_PHONE = '5543999784846'; // +55 43 9 9978-4846
export const COMPANY_NAME = 'Moleta Carros';
export const COMPANY_LOCATION = 'Uraí, PR';
// Endereço do pátio — usado no link "Como chegar" (Google Maps). Fonte: Marcelo (18/09/2026).
export const COMPANY_ADDRESS = 'Moleta Veículos, Av. Paraná, 890, Uraí - PR, 86280-000';

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
