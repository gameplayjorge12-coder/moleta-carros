import { describe, it, expect } from 'vitest';
import { isBotNoise } from '@/lib/mesh/noise';

describe('MALHA classificador de ruído/bot [T5]', () => {
  it('humano real BR passa', () => {
    expect(isBotNoise({ asn: 'AS28573 Claro NXT', lang: 'pt-BR', tz: 'America/Sao_Paulo', ua: 'Mozilla/5.0 iPhone' }).bot).toBe(false);
  });

  it('datacenter é ruído', () => {
    const r = isBotNoise({ asn: 'AS14061 DigitalOcean LLC', lang: 'pt-BR' });
    expect(r.bot).toBe(true);
    expect(r.reason).toBe('datacenter_asn');
  });

  it('crawler pelo UA é ruído', () => {
    expect(isBotNoise({ ua: 'Googlebot/2.1', lang: 'pt-BR' }).reason).toBe('ua_bot');
    expect(isBotNoise({ ua: 'python-requests/2.31' }).bot).toBe(true);
  });

  it('idioma não-pt é ruído', () => {
    expect(isBotNoise({ lang: 'en-US', tz: 'America/New_York' }).reason).toBe('lang_nao_pt');
  });

  it('fuso fora das Américas é ruído', () => {
    expect(isBotNoise({ lang: 'pt-PT', tz: 'Europe/Lisbon' }).reason).toBe('tz_fora_americas');
  });

  it('sinal vazio não quebra (assume humano até prova)', () => {
    expect(isBotNoise({}).bot).toBe(false);
  });
});
