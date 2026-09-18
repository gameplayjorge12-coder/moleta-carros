/**
 * Gerador de links dinâmicos do WhatsApp
 * Conforme o Design System — mensagem pré-formatada com urgência
 */

import { MARCELO_PHONE, COMPANY_ADDRESS } from './constants';

/**
 * Gera URL do WhatsApp com mensagem pré-preenchida
 *
 * @param carTitle - Nome do veículo (ex: "Hyundai Creta 2021")
 * @param category - Categoria (venda | aluguel)
 * @param price - Preço do veículo (opcional, para urgência)
 * @returns URL completa do wa.me
 *
 * @example
 * getWhatsAppLink("Hyundai Creta 2021", "venda", 45990)
 * // https://wa.me/5585987654321?text=Olá%20Marcelo!...
 */
export function getWhatsAppLink(
  carTitle: string,
  category: 'venda' | 'aluguel' | 'ambos',
  price?: number
): string {
  // Texto limpo (sem emoji) — emoji corrompe no encode em alguns aparelhos
  const categoryLabel =
    category === 'venda'
      ? 'Venda'
      : category === 'aluguel'
        ? 'Locadora'
        : 'Venda e Aluguel';

  let message = `Olá Marcelo! Vi o veículo "${carTitle}" (${categoryLabel}) no site da Moleta Carros.`;

  if (price) {
    message += ` Preço: R$ ${price.toLocaleString('pt-BR')}.`;
  }

  message += ` Poderia me passar mais informações sobre esse carro?`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${MARCELO_PHONE}?text=${encodedMessage}`;
}

/**
 * Link simplificado (sem preço) para uso em CTAs gerais
 */
export function getWhatsAppSimpleLink(): string {
  const message = `Olá Marcelo! Vi o site da Moleta Carros e gostaria de conhecer os seus veículos. Qual o melhor horário para conversar?`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${MARCELO_PHONE}?text=${encodedMessage}`;
}

/**
 * Link do Google Maps para o pátio (sem chave de API, abre o app no celular).
 */
export function getMapsLink(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_ADDRESS)}`;
}

/**
 * CTA da oferta 0km — mensagem pré-pronta focada em CNPJ / produtor rural.
 */
export function getWhatsAppZeroKmLink(): string {
  const message =
    'Olá Marcelo! Vi no site a oferta de carro 0km com desconto para CNPJ / produtor rural (parceria Fiat). Pode me passar os valores e as condições?';
  return `https://wa.me/${MARCELO_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Valida número de telefone (apenas dígitos, 11 caracteres)
 */
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 12 || cleaned.length === 11;
}
