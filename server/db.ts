import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";
import config from "./config";

// Cria o pool de conexões com as configurações do arquivo config.ts
const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.database.ssl,
  ...config.database.pool,
});

// Testar a conexão ao iniciar
pool.on('error', (err) => {
  console.error('Erro inesperado no cliente do banco de dados', err);
  process.exit(-1);
});

// Testar conexão
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao banco de dados com sucesso!');
    client.release();
  } catch (err) {
    console.error('❌ Falha ao conectar ao banco de dados:', err);
    process.exit(1);
  }
}

// Apenas em desenvolvimento, testa a conexão ao iniciar
if (process.env.NODE_ENV !== 'test') {
  testConnection().catch(console.error);
}

export const db = drizzle(pool, { schema });