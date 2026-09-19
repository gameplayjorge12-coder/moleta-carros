'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/mesh/client';

// Rastreador global do MALHA. Montado uma vez no app:
//  - page_view a cada rota
//  - car_detail_view quando a rota é /carro/<id> (id sai da própria URL)
//  - whatsapp_click via listener delegado em qualquer <a href="https://wa.me/...">
// Zero edição por componente. Best-effort — nunca quebra a página.
export function MeshTracker() {
  const pathname = usePathname();

  // page_view + car_detail_view por rota
  useEffect(() => {
    const m = pathname.match(/^\/carro\/([0-9a-f-]{10,})/i);
    if (m) {
      track({ tipo: 'car_detail_view', veiculo_id: m[1], payload: { path: pathname } });
    } else {
      track({ tipo: 'page_view', payload: { path: pathname } });
    }
  }, [pathname]);

  // whatsapp_click delegado (pega todo botão de WhatsApp do site)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest('a[href^="https://wa.me/"]');
      if (!el) return;
      const href = el.getAttribute('href') || '';
      const carId = pathname.match(/^\/carro\/([0-9a-f-]{10,})/i)?.[1];
      track({
        tipo: 'whatsapp_click',
        veiculo_id: carId,
        payload: { href, path: pathname },
      });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true } as any);
  }, [pathname]);

  return null;
}
