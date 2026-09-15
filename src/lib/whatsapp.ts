/**
 * Gerador de links dinâmicos do WhatsApp
 * Conforme o Design System — mensagem pré-formatada com urgência
 */

import { MARCELO_PHONE } from './constants';

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
  const categoryLabel =
    category === 'venda'
      ? '🚗 Venda'
      : category === 'aluguel'
        ? '🔑 Locadora'
        : '🚗🔑 Venda e Aluguel';

  let message = `Olá Marcelo! 👋\n\n`;
  message += `Vi o veículo "${carTitle}" (${categoryLabel}) no site da Moleta Carros`;

  if (price) {
    message += ` e adorei! 💯\n\n💰 Preço: R$ ${price.toLocaleString('pt-BR')}`;
  }

  message += `\n\nPoderia me passar mais informações? Gostaria de saber mais sobre esse carro! 🤔`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${MARCELO_PHONE}?text=${encodedMessage}`;
}

/**
 * Link simplificado (sem preço) para uso em CTAs gerais
 */
export function getWhatsAppSimpleLink(): string {
  const message = `Olá Marcelo! Vi o site da Moleta Carros e gostaria de conhecer os seus veículos. Qual o melhor horário para conversar? 👋`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${MARCELO_PHONE}?text=${encodedMessage}`;
}

/**
 * Valida número de telefone (apenas dígitos, 11 caracteres)
 */
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 12 || cleaned.length === 11;
}
