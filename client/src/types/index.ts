
export interface Musica {
  id: string;
  nome: string;
  cantor?: string;
  linkYoutube?: string;
  partitura?: string;
  linkDownload?: string;
  secaoLiturgica: SecaoLiturgica;
  observacoes?: string;
  missaId: string;
}

export interface Missa {
  id: string;
  data: string;
  horario: string;
  tipo: string; // ex: "Domingo", "Festa de São João", etc.
  musicosEscalados: string[]; // IDs dos músicos
  musicas: Musica[];
  observacoes?: string;
}

export interface Musico {
  id: string;
  nome: string;
  funcao: string;
  disponivel: boolean;
  contato?: {
    email?: string;
    telefone?: string;
  };
  foto?: string;
  anotacoes: string[];
  sugestoes: Sugestao[];
  observacoesPermanentes?: string;
}

export interface Sugestao {
  id: string;
  texto: string;
  status: 'pendente' | 'implementada' | 'recusada';
  data: string;
}

export type SecaoLiturgica = 
  | 'entrada'
  | 'ato-penitencial'
  | 'gloria'
  | 'salmo-responsorial'
  | 'aclamacao-evangelho'
  | 'ofertorio'
  | 'santo'
  | 'cordeiro'
  | 'comunhao'
  | 'acao-gracas'
  | 'final';

export const SECOES_LITURGICAS: Record<SecaoLiturgica, string> = {
  'entrada': '🔹 1. Entrada',
  'ato-penitencial': '🔹 2. Ato Penitencial',
  'gloria': '🔹 3. Glória',
  'salmo-responsorial': '🔹 4. Salmo Responsorial',
  'aclamacao-evangelho': '🔹 5. Aclamação ao Evangelho',
  'ofertorio': '🔹 6. Ofertório',
  'santo': '🔹 7. Santo',
  'cordeiro': '🔹 8. Cordeiro de Deus',
  'comunhao': '🔹 9. Comunhão',
  'acao-gracas': '🔹 10. Ação de Graças',
  'final': '🔹 11. Final (Saída)'
};
