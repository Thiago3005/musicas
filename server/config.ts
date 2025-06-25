import dotenv from 'dotenv';
import path from 'path';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
  override: true, // Sobrescreve variáveis de ambiente já definidas
});

// Valida variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Variável de ambiente obrigatória não encontrada: ${envVar}`);
    process.exit(1);
  }
}

console.log('✅ Variáveis de ambiente carregadas com sucesso!');

// Exporta as configurações
export default {
  // Configurações do banco de dados
  database: {
    url: process.env.DATABASE_URL!,
    ssl: {
      rejectUnauthorized: false // Necessário para conexão com Supabase
    },
    pool: {
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  },
  
  // Configurações de autenticação
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    sessionSecret: process.env.SESSION_SECRET || 'dev_session_secret_123',
  },
  
  // Configurações do Supabase
  supabase: {
    url: process.env.VITE_SUPABASE_URL!,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY!,
  },
  
  // Configurações do servidor
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
  }
};
