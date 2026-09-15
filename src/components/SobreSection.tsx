import Image from 'next/image';
import { getWhatsAppSimpleLink } from '@/lib/whatsapp';
import { Reveal } from '@/components/Reveal';

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
