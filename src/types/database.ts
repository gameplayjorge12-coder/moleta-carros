/**
 * Tipos gerados do schema Supabase
 * ⚠️ Atualizar após mudanças no banco
 */

export type Database = {
  public: {
    Tables: {
      veiculos: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          titulo: string;
          preco: number;
          categoria: 'venda' | 'aluguel';
          descricao: string | null;
          fotos: string[]; // URLs das imagens no Supabase Storage
          status: 'disponivel' | 'vendido';
          views: number; // Contador de visualizações
        };
        Insert: Omit<Database['public']['Tables']['veiculos']['Row'], 'id' | 'created_at' | 'updated_at' | 'views'>;
        Update: Partial<Database['public']['Tables']['veiculos']['Insert']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
