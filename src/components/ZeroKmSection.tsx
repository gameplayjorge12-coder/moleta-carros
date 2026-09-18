import { BadgeCheck, Leaf, Building2, MessageCircle } from 'lucide-react';
import { getWhatsAppZeroKmLink } from '@/lib/whatsapp';

/**
 * Oferta 0KM — bloco de conversão dedicado (não é categoria do catálogo de usados).
 * Engenharia social: auto-seleção de público (CNPJ / produtor rural) + autoridade
 * (parceria Fiat Samp) + benefício claro (desconto de frota) + CTA de baixo atrito.
 * Fica logo abaixo do hero — posição nobre, sem trocar a primeira impressão do pátio.
 * Fotos: Fiat Toro 0km enviado pelo Marcelo (18/09), tratadas em /public/zero-km.
 */
const FOTOS = [
  { src: '/zero-km/toro-frente.jpg', alt: 'Fiat Toro 0km na Moleta Veículos' },
  { src: '/zero-km/toro-lateral.jpg', alt: 'Fiat Toro 0km — vista lateral no pátio' },
  { src: '/zero-km/toro-interior.jpg', alt: 'Interior novo do Fiat Toro 0km (bancos ainda no plástico)' },
  { src: '/zero-km/toro-frontal.jpg', alt: 'Fiat Toro 0km — frente' },
  { src: '/zero-km/toro-traseira.jpg', alt: 'Fiat Toro 0km — traseira' },
  { src: '/zero-km/toro-roda.jpg', alt: 'Roda do Fiat Toro 0km' },
];

export function ZeroKmSection() {
  return (
    <section id="zero-km" className="bg-secondary text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <span className="inline-flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          <BadgeCheck className="w-4 h-4" /> Novo · 0KM
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 leading-tight">
          Tem CNPJ ou é produtor rural?
        </h2>
        <p className="text-white/85 text-lg mt-3 max-w-2xl">
          Carro <strong>0km com desconto de frota</strong>, em parceria com a{' '}
          <strong>Fiat Samp</strong>. Condições especiais para empresas e produtores rurais.
        </p>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3 max-w-3xl">
          <li className="flex items-center gap-2 text-white/90">
            <Building2 className="w-5 h-5 text-primary shrink-0" /> Desconto exclusivo CNPJ
          </li>
          <li className="flex items-center gap-2 text-white/90">
            <Leaf className="w-5 h-5 text-primary shrink-0" /> Condição produtor rural
          </li>
          <li className="flex items-center gap-2 text-white/90">
            <BadgeCheck className="w-5 h-5 text-primary shrink-0" /> Modelos 0km · sob consulta
          </li>
        </ul>

        {/* Faixa de fotos do 0km */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FOTOS.map((f) => (
            <div key={f.src} className="aspect-[4/3] overflow-hidden rounded-lg bg-black/20">
              <img
                src={f.src}
                alt={f.alt}
                loading="lazy"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>

        <a
          href={getWhatsAppZeroKmLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2 mt-8 text-base px-6 py-3.5"
        >
          <MessageCircle className="w-5 h-5" /> Consultar valores no WhatsApp
        </a>
      </div>
    </section>
  );
}
