#!/usr/bin/env node
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://npxqnedaaeuzitdiqgvd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DelFVyltvib5ej0Uj6ZAHA_cVaxNN9S';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const carros = JSON.parse(fs.readFileSync('./seeds.json', 'utf-8'));

console.log('🚗 Adicionando 10 carros ao banco...\n');

for (const carro of carros) {
  try {
    const { data, error } = await supabase
      .from('veiculos')
      .insert([carro])
      .select();

    if (error) {
      console.error(`❌ ${carro.titulo}: ${error.message}`);
    } else {
      console.log(`✅ ${carro.titulo}`);
    }
  } catch (err) {
    console.error(`❌ Erro: ${err.message}`);
  }
}

console.log('\n🎉 Seed completo!');
