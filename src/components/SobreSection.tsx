import Image from 'next/image';
import { MapPin, Eye, UserCheck, Camera } from 'lucide-react';
import { getWhatsAppSimpleLink } from '@/lib/whatsapp';
import { Reveal } from '@/components/Reveal';

// Anti-golpe (B): prova de legitimidade que reduz o medo de comprar usado online.
// Tudo verdadeiro e verificável. (CNPJ entra aqui quando o Marcelo enviar.)
const GARANTIAS = [
  { icon: MapPin, t: 'Loja física em Uraí, PR', s: 'Endereço real — venha ver no mapa' },
  { icon: Eye, t: 'Veja o carro pessoalmente', s: 'Confira antes de fechar negócio' },
  { icon: UserCheck, t: 'Direto com o Marcelo', s: 'Sem intermediário, sem robô' },
  { icon: Camera, t: 'Fotos reais dos veículos', s: 'Nada de foto de catálogo' },
];

const PATIO =
  'https://npxqnedaaeuzitdiqgvd.supabase.co/storage/v1/object/public/veiculos/patio.jpg';

/** Seção "Sobre a loja" com a foto do pátio (Fase E). */
export function SobreSection() {
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <Reveal>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={PATIO}
              alt="Pátio da Moleta Veículos em Uraí, PR"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wide">
              Quem somos
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary mt-2">
              Sobre a Moleta Veículos
            </h2>
            <p className="text-neutral-700 mt-4 leading-relaxed">
              Em Uraí-PR, a Moleta Veículos oferece uma seleção de carros para
              venda e locação, com atendimento direto e sem burocracia. Venha
              conhecer o nosso pátio pessoalmente ou fale com o Marcelo pelo
              WhatsApp — ele tira todas as suas dúvidas sobre valores, quilometragem
              e condições.
            </p>
            {/* Garantias anti-golpe */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {GARANTIAS.map((g, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <g.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-800 leading-tight">{g.t}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{g.s}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href={getWhatsAppSimpleLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 mt-6"
            >
              💬 Falar com o Marcelo
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
