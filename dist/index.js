var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/config.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
  override: true
  // Sobrescreve variáveis de ambiente já definidas
});
var requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY"
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`\u274C Vari\xE1vel de ambiente obrigat\xF3ria n\xE3o encontrada: ${envVar}`);
    process.exit(1);
  }
}
console.log("\u2705 Vari\xE1veis de ambiente carregadas com sucesso!");
var config_default = {
  // Configurações do banco de dados
  database: {
    url: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
      // Necessário para conexão com Supabase
    },
    pool: {
      max: 10,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 1e4
    }
  },
  // Configurações de autenticação
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    sessionSecret: process.env.SESSION_SECRET || "dev_session_secret_123"
  },
  // Configurações do Supabase
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY
  },
  // Configurações do servidor
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5e3,
    nodeEnv: process.env.NODE_ENV || "development"
  }
};

// server/index.ts
import express2 from "express";
import cors from "cors";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { eq, desc } from "drizzle-orm";

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  authUsers: () => authUsers,
  bibliotecaMusicas: () => bibliotecaMusicas,
  insertBibliotecaMusicaSchema: () => insertBibliotecaMusicaSchema,
  insertMissaSchema: () => insertMissaSchema,
  insertMusicaSchema: () => insertMusicaSchema,
  insertMusicoIndisponibilidadeSchema: () => insertMusicoIndisponibilidadeSchema,
  insertMusicoSchema: () => insertMusicoSchema,
  insertUserSchema: () => insertUserSchema,
  missaMusicos: () => missaMusicos,
  missas: () => missas,
  musicas: () => musicas,
  musicoAnotacoes: () => musicoAnotacoes,
  musicoIndisponibilidade: () => musicoIndisponibilidade,
  musicoSugestoes: () => musicoSugestoes,
  musicos: () => musicos,
  passwordResetTokens: () => passwordResetTokens,
  userSessions: () => userSessions,
  users: () => users2
});
import { pgTable, text, serial, boolean, uuid, timestamp, date, time, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
var authUsers = pgTable("auth_users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 20 }).notNull(),
  instrumento: varchar("instrumento", { length: 100 }),
  telefone: varchar("telefone", { length: 20 }),
  foto: text("foto"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var userSessions = pgTable("user_sessions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});
var users2 = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var musicos = pgTable("musicos", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  funcao: text("funcao").notNull(),
  disponivel: boolean("disponivel").notNull().default(true),
  email: text("email"),
  telefone: text("telefone"),
  foto: text("foto"),
  observacoes_permanentes: text("observacoes_permanentes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var musicoAnotacoes = pgTable("musico_anotacoes", {
  id: uuid("id").defaultRandom().primaryKey(),
  musico_id: uuid("musico_id").references(() => musicos.id, { onDelete: "cascade" }).notNull(),
  texto: text("texto").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
var musicoSugestoes = pgTable("musico_sugestoes", {
  id: uuid("id").defaultRandom().primaryKey(),
  musico_id: uuid("musico_id").references(() => musicos.id, { onDelete: "cascade" }).notNull(),
  texto: text("texto").notNull(),
  status: text("status").notNull().default("pendente"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var musicoIndisponibilidade = pgTable("musico_indisponibilidade", {
  id: uuid("id").defaultRandom().primaryKey(),
  musico_id: uuid("musico_id").references(() => musicos.id, { onDelete: "cascade" }).notNull(),
  data_inicio: date("data_inicio").notNull(),
  data_fim: date("data_fim").notNull(),
  motivo: text("motivo").notNull(),
  // ferias, compromisso_pessoal, outro
  motivo_outro: text("motivo_outro"),
  // para quando motivo = 'outro'
  observacoes: text("observacoes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var missas = pgTable("missas", {
  id: uuid("id").defaultRandom().primaryKey(),
  data: date("data").notNull(),
  horario: time("horario").notNull(),
  tipo: text("tipo").notNull(),
  observacoes: text("observacoes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var missaMusicos = pgTable("missa_musicos", {
  id: uuid("id").defaultRandom().primaryKey(),
  missa_id: uuid("missa_id").references(() => missas.id, { onDelete: "cascade" }).notNull(),
  musico_id: uuid("musico_id").references(() => musicos.id, { onDelete: "cascade" }).notNull(),
  parte_missa: text("parte_missa").notNull(),
  // entrada, kyrie, gloria, aclamacao, ofertorio, sanctus, comunhao, saida
  funcao: text("funcao").notNull().default("vocal"),
  // vocal, backvocal, instrumental, solista
  instrumento: text("instrumento"),
  // violao, piano, flauta, etc
  observacoes: text("observacoes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
var musicas = pgTable("musicas", {
  id: uuid("id").defaultRandom().primaryKey(),
  missa_id: uuid("missa_id").references(() => missas.id, { onDelete: "cascade" }).notNull(),
  nome: text("nome").notNull(),
  cantor: text("cantor"),
  link_youtube: text("link_youtube"),
  partitura_texto: text("partitura_texto"),
  link_download: text("link_download"),
  secao_liturgica: text("secao_liturgica").notNull(),
  observacoes: text("observacoes"),
  biblioteca_musica_id: uuid("biblioteca_musica_id").references(() => bibliotecaMusicas.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var bibliotecaMusicas = pgTable("biblioteca_musicas", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  cantor: text("cantor"),
  link_youtube: text("link_youtube"),
  partitura_texto: text("partitura_texto"),
  link_download: text("link_download"),
  secao_liturgica: text("secao_liturgica"),
  observacoes: text("observacoes"),
  youtube_video_id: text("youtube_video_id"),
  thumbnail: text("thumbnail"),
  duracao: text("duracao"),
  link_cifras_goiania: text("link_cifras_goiania"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users2).pick({
  username: true,
  password: true
});
var insertMusicoSchema = createInsertSchema(musicos);
var insertMissaSchema = createInsertSchema(missas);
var insertMusicaSchema = createInsertSchema(musicas);
var insertBibliotecaMusicaSchema = createInsertSchema(bibliotecaMusicas);
var insertMusicoIndisponibilidadeSchema = createInsertSchema(musicoIndisponibilidade);

// server/db.ts
var pool = new Pool({
  connectionString: config_default.database.url,
  ssl: config_default.database.ssl,
  ...config_default.database.pool
});
pool.on("error", (err) => {
  console.error("Erro inesperado no cliente do banco de dados", err);
  process.exit(-1);
});
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("\u2705 Conectado ao banco de dados com sucesso!");
    client.release();
  } catch (err) {
    console.error("\u274C Falha ao conectar ao banco de dados:", err);
    process.exit(1);
  }
}
if (process.env.NODE_ENV !== "test") {
  testConnection().catch(console.error);
}
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
var DatabaseStorage = class {
  // Users
  async getUser(id) {
    const result = await db.select().from(users2).where(eq(users2.id, id));
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await db.select().from(users2).where(eq(users2.username, username));
    return result[0];
  }
  async createUser(insertUser) {
    const result = await db.insert(users2).values(insertUser).returning();
    return result[0];
  }
  // Musicos
  async getMusicos() {
    return await db.select().from(musicos);
  }
  async getMusicoById(id) {
    const result = await db.select().from(musicos).where(eq(musicos.id, id));
    return result[0];
  }
  async createMusico(musico) {
    const result = await db.insert(musicos).values(musico).returning();
    return result[0];
  }
  async updateMusico(id, musico) {
    const result = await db.update(musicos).set(musico).where(eq(musicos.id, id)).returning();
    return result[0];
  }
  async deleteMusico(id) {
    await db.delete(musicos).where(eq(musicos.id, id));
  }
  // Missas
  async getMissas() {
    return await db.select().from(missas);
  }
  async getMissaById(id) {
    const result = await db.select().from(missas).where(eq(missas.id, id));
    return result[0];
  }
  async createMissa(missa) {
    const result = await db.insert(missas).values(missa).returning();
    return result[0];
  }
  async updateMissa(id, missa) {
    const result = await db.update(missas).set(missa).where(eq(missas.id, id)).returning();
    return result[0];
  }
  async deleteMissa(id) {
    await db.delete(missas).where(eq(missas.id, id));
  }
  // Musicas
  async getMusicasByMissaId(missaId) {
    return await db.select().from(musicas).where(eq(musicas.missa_id, missaId));
  }
  async createMusica(musica) {
    const result = await db.insert(musicas).values(musica).returning();
    return result[0];
  }
  async deleteMusica(id) {
    await db.delete(musicas).where(eq(musicas.id, id));
  }
  // Biblioteca de Musicas
  async getBibliotecaMusicas() {
    return await db.select().from(bibliotecaMusicas);
  }
  async createBibliotecaMusica(musica) {
    const result = await db.insert(bibliotecaMusicas).values(musica).returning();
    return result[0];
  }
  async deleteBibliotecaMusica(id) {
    await db.delete(bibliotecaMusicas).where(eq(bibliotecaMusicas.id, id));
  }
  // Anotacoes
  async getAnotacoesByMusicoId(musicoId) {
    return await db.select().from(musicoAnotacoes).where(eq(musicoAnotacoes.musico_id, musicoId));
  }
  async createAnotacao(musicoId, texto) {
    const result = await db.insert(musicoAnotacoes).values({ musico_id: musicoId, texto }).returning();
    return result[0];
  }
  async deleteAnotacao(id) {
    await db.delete(musicoAnotacoes).where(eq(musicoAnotacoes.id, id));
  }
  // Sugestoes
  async getSugestoesByMusicoId(musicoId) {
    return await db.select().from(musicoSugestoes).where(eq(musicoSugestoes.musico_id, musicoId));
  }
  async createSugestao(musicoId, texto) {
    const result = await db.insert(musicoSugestoes).values({ musico_id: musicoId, texto }).returning();
    return result[0];
  }
  async updateSugestaoStatus(id, status) {
    const result = await db.update(musicoSugestoes).set({ status }).where(eq(musicoSugestoes.id, id)).returning();
    return result[0];
  }
  // Indisponibilidades
  async getIndisponibilidades() {
    return db.select().from(musicoIndisponibilidade).orderBy(desc(musicoIndisponibilidade.created_at));
  }
  async getIndisponibilidadesByMusicoId(musicoId) {
    return db.select().from(musicoIndisponibilidade).where(eq(musicoIndisponibilidade.musico_id, musicoId)).orderBy(desc(musicoIndisponibilidade.data_inicio));
  }
  async createIndisponibilidade(data) {
    const result = await db.insert(musicoIndisponibilidade).values(data).returning();
    return result[0];
  }
  async updateIndisponibilidade(id, data) {
    const result = await db.update(musicoIndisponibilidade).set({ ...data, updated_at: /* @__PURE__ */ new Date() }).where(eq(musicoIndisponibilidade.id, id)).returning();
    return result[0];
  }
  async deleteIndisponibilidade(id) {
    await db.delete(musicoIndisponibilidade).where(eq(musicoIndisponibilidade.id, id));
  }
  async getMissaMusicos(missaId) {
    const result = await db.select({
      id: missaMusicos.id,
      parte_missa: missaMusicos.parte_missa,
      funcao: missaMusicos.funcao,
      instrumento: missaMusicos.instrumento,
      observacoes: missaMusicos.observacoes,
      musico: {
        id: musicos.id,
        nome: musicos.nome,
        funcao: musicos.funcao,
        instrumento: musicos.email
      }
    }).from(missaMusicos).leftJoin(musicos, eq(missaMusicos.musico_id, musicos.id)).where(eq(missaMusicos.missa_id, missaId));
    return result;
  }
  async createMissaMusico(data) {
    const result = await db.insert(missaMusicos).values({
      missa_id: data.missa_id,
      musico_id: data.musico_id,
      parte_missa: data.parte_missa,
      funcao: data.funcao,
      instrumento: data.instrumento,
      observacoes: data.observacoes
    }).returning();
    return result[0];
  }
  async deleteMissaMusico(id) {
    await db.delete(missaMusicos).where(eq(missaMusicos.id, id));
  }
};
var storage = new DatabaseStorage();

// server/authRoutes.ts
import { Router } from "express";

// shared/authSchema.ts
import { pgTable as pgTable2, varchar as varchar2, boolean as boolean2, timestamp as timestamp2, text as text2 } from "drizzle-orm/pg-core";
import { sql as sql2 } from "drizzle-orm";
var authUsers2 = pgTable2("auth_users", {
  id: varchar2("id", { length: 36 }).primaryKey().default(sql2`gen_random_uuid()`),
  email: varchar2("email", { length: 255 }).unique().notNull(),
  password: varchar2("password", { length: 255 }).notNull(),
  nome: varchar2("nome", { length: 255 }).notNull(),
  tipo: varchar2("tipo", { length: 20 }).notNull(),
  // 'admin' ou 'musico'
  instrumento: varchar2("instrumento", { length: 100 }),
  telefone: varchar2("telefone", { length: 20 }),
  foto: text2("foto"),
  ativo: boolean2("ativo").default(true),
  createdAt: timestamp2("created_at").defaultNow(),
  updatedAt: timestamp2("updated_at").defaultNow()
});
var passwordResetTokens2 = pgTable2("password_reset_tokens", {
  id: varchar2("id", { length: 36 }).primaryKey().default(sql2`gen_random_uuid()`),
  userId: varchar2("user_id", { length: 36 }).notNull(),
  token: varchar2("token", { length: 255 }).notNull(),
  expiresAt: timestamp2("expires_at").notNull(),
  used: boolean2("used").default(false),
  createdAt: timestamp2("created_at").defaultNow()
});
var userSessions2 = pgTable2("user_sessions", {
  id: varchar2("id", { length: 36 }).primaryKey().default(sql2`gen_random_uuid()`),
  userId: varchar2("user_id", { length: 36 }).notNull(),
  token: varchar2("token", { length: 255 }).notNull(),
  expiresAt: timestamp2("expires_at").notNull(),
  lastActivity: timestamp2("last_activity").defaultNow(),
  createdAt: timestamp2("created_at").defaultNow()
});

// server/authRoutes.ts
import { eq as eq3 } from "drizzle-orm";

// server/auth.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { eq as eq2, and, gt } from "drizzle-orm";
var JWT_SECRET = process.env.JWT_SECRET || "default-secret-key-change-in-production";
var SESSION_DURATION = 30 * 60 * 1e3;
async function hashPassword(password) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
async function createUserSession(userId) {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  await db.insert(userSessions2).values({
    userId,
    token: sessionToken,
    expiresAt,
    lastActivity: /* @__PURE__ */ new Date()
  });
  return sessionToken;
}
async function validateSession(sessionToken) {
  const session = await db.select().from(userSessions2).where(
    and(
      eq2(userSessions2.token, sessionToken),
      gt(userSessions2.expiresAt, /* @__PURE__ */ new Date())
    )
  ).limit(1);
  if (session.length === 0) {
    return null;
  }
  await db.update(userSessions2).set({
    lastActivity: /* @__PURE__ */ new Date(),
    expiresAt: new Date(Date.now() + SESSION_DURATION)
  }).where(eq2(userSessions2.id, session[0].id));
  const user = await db.select().from(authUsers2).where(eq2(authUsers2.id, session[0].userId)).limit(1);
  if (user.length === 0) {
    return null;
  }
  const userData = user[0];
  return {
    id: userData.id,
    email: userData.email,
    nome: userData.nome,
    tipo: userData.tipo,
    instrumento: userData.instrumento || void 0,
    telefone: userData.telefone || void 0,
    foto: userData.foto || void 0
  };
}
async function authenticateToken(req, res, next) {
  console.log("[authenticateToken] Iniciando valida\xE7\xE3o de token");
  const authHeader = req.headers["authorization"];
  console.log("[authenticateToken] Authorization header:", authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  console.log("[authenticateToken] Token extra\xEDdo:", token ? `${token.substring(0, 10)}...` : "Nenhum token encontrado");
  if (!token) {
    console.error("[authenticateToken] Erro: Nenhum token fornecido");
    return res.status(401).json({ error: "Token de acesso requerido" });
  }
  try {
    console.log("[authenticateToken] Validando token...");
    const user = await validateSession(token);
    if (!user) {
      console.error("[authenticateToken] Erro: Token inv\xE1lido ou expirado");
      return res.status(401).json({ error: "Token inv\xE1lido ou expirado" });
    }
    console.log(`[authenticateToken] Token v\xE1lido para usu\xE1rio: ${user.email} (${user.id})`);
    req.user = user;
    next();
  } catch (error) {
    console.error("[authenticateToken] Erro ao validar token:", error);
    return res.status(403).json({ error: "Token inv\xE1lido" });
  }
}
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Usu\xE1rio n\xE3o autenticado" });
  }
  if (req.user.tipo !== "admin") {
    return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
  }
  next();
}
async function generatePasswordResetToken(email) {
  const user = await db.select().from(authUsers2).where(eq2(authUsers2.email, email)).limit(1);
  if (user.length === 0) {
    return null;
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
  await db.insert(passwordResetTokens2).values({
    userId: user[0].id,
    token: resetToken,
    expiresAt
  });
  return resetToken;
}
async function validatePasswordResetToken(token) {
  const resetToken = await db.select().from(passwordResetTokens2).where(
    and(
      eq2(passwordResetTokens2.token, token),
      eq2(passwordResetTokens2.used, false),
      gt(passwordResetTokens2.expiresAt, /* @__PURE__ */ new Date())
    )
  ).limit(1);
  if (resetToken.length === 0) {
    return null;
  }
  return resetToken[0].userId;
}
async function markPasswordResetTokenAsUsed(token) {
  await db.update(passwordResetTokens2).set({ used: true }).where(eq2(passwordResetTokens2.token, token));
}
async function logoutUser(sessionToken) {
  await db.delete(userSessions2).where(eq2(userSessions2.token, sessionToken));
}

// server/authRoutes.ts
var authRouter = Router();
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha s\xE3o obrigat\xF3rios" });
    }
    const user = await db.select().from(authUsers2).where(eq3(authUsers2.email, email)).limit(1);
    if (user.length === 0) {
      return res.status(401).json({ error: "Credenciais inv\xE1lidas" });
    }
    const userData = user[0];
    if (!userData.ativo) {
      return res.status(401).json({ error: "Usu\xE1rio desativado" });
    }
    const passwordValid = await verifyPassword(password, userData.password);
    if (!passwordValid) {
      return res.status(401).json({ error: "Credenciais inv\xE1lidas" });
    }
    const sessionToken = await createUserSession(userData.id);
    const userResponse = {
      id: userData.id,
      email: userData.email,
      nome: userData.nome,
      tipo: userData.tipo,
      instrumento: userData.instrumento,
      telefone: userData.telefone,
      foto: userData.foto
    };
    res.json({
      user: userResponse,
      token: sessionToken,
      message: "Login realizado com sucesso"
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
authRouter.post("/logout", authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      await logoutUser(token);
    }
    res.json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error("Erro no logout:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
authRouter.get("/me", authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});
authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email \xE9 obrigat\xF3rio" });
    }
    const resetToken = await generatePasswordResetToken(email);
    if (resetToken) {
      console.log(`Token de recupera\xE7\xE3o para ${email}: ${resetToken}`);
    }
    res.json({ message: "Se o email existir, voc\xEA receber\xE1 instru\xE7\xF5es de recupera\xE7\xE3o" });
  } catch (error) {
    console.error("Erro na recupera\xE7\xE3o de senha:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
authRouter.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token e nova senha s\xE3o obrigat\xF3rios" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" });
    }
    const userId = await validatePasswordResetToken(token);
    if (!userId) {
      return res.status(400).json({ error: "Token inv\xE1lido ou expirado" });
    }
    const hashedPassword = await hashPassword(newPassword);
    await db.update(users).set({
      password: hashedPassword,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq3(users.id, userId));
    await markPasswordResetTokenAsUsed(token);
    res.json({ message: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error("Erro na redefini\xE7\xE3o de senha:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
authRouter.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const allUsers = await db.select({
      id: authUsers2.id,
      email: authUsers2.email,
      nome: authUsers2.nome,
      tipo: authUsers2.tipo,
      instrumento: authUsers2.instrumento,
      telefone: authUsers2.telefone,
      foto: authUsers2.foto,
      ativo: authUsers2.ativo,
      createdAt: authUsers2.createdAt
    }).from(authUsers2).orderBy(authUsers2.nome);
    res.json(allUsers);
  } catch (error) {
    console.error("Erro ao listar usu\xE1rios:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
authRouter.post("/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, password, nome, tipo, instrumento, telefone, foto } = req.body;
    if (!email || !password || !nome || !tipo) {
      return res.status(400).json({ error: "Email, senha, nome e tipo s\xE3o obrigat\xF3rios" });
    }
    if (!["admin", "musico"].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo deve ser "admin" ou "musico"' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" });
    }
    const existingUser = await db.select().from(authUsers2).where(eq3(authUsers2.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email j\xE1 est\xE1 em uso" });
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await db.insert(authUsers2).values({
      email,
      password: hashedPassword,
      nome,
      tipo,
      instrumento: tipo === "musico" ? instrumento : null,
      telefone,
      foto
    }).returning();
    const { password: _, ...userResponse } = newUser[0];
    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Erro ao criar usu\xE1rio:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
authRouter.put("/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nome, tipo, instrumento, telefone, foto, ativo, newPassword } = req.body;
    const updateData = {
      email,
      nome,
      tipo,
      instrumento: tipo === "musico" ? instrumento : null,
      telefone,
      foto,
      ativo,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" });
      }
      updateData.password = await hashPassword(newPassword);
    }
    const updatedUser = await db.update(authUsers2).set(updateData).where(eq3(authUsers2.id, id)).returning();
    if (updatedUser.length === 0) {
      return res.status(404).json({ error: "Usu\xE1rio n\xE3o encontrado" });
    }
    const { password: _, ...userResponse } = updatedUser[0];
    res.json(userResponse);
  } catch (error) {
    console.error("Erro ao atualizar usu\xE1rio:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
authRouter.delete("/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user?.id === id) {
      return res.status(400).json({ error: "N\xE3o \xE9 poss\xEDvel deletar seu pr\xF3prio usu\xE1rio" });
    }
    const deletedUser = await db.delete(authUsers2).where(eq3(authUsers2.id, id)).returning();
    if (deletedUser.length === 0) {
      return res.status(404).json({ error: "Usu\xE1rio n\xE3o encontrado" });
    }
    res.json({ message: "Usu\xE1rio deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usu\xE1rio:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// server/musicSearchService.ts
import axios from "axios";
var MusicSearchService = class {
  static YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyB4UJR8RSCxKjcMFwUD7vdTJRGd5ADVrQM";
  static CIFRAS_GOIANIA_BASE_URL = "https://arquidiocesegoiania.org.br/cifras-e-partituras/";
  static CNV_MP3_BASE_URL = "https://cnvmp3.com/v25/";
  static async searchYouTube(query) {
    if (!this.YOUTUBE_API_KEY) {
      console.warn("YouTube API key not configured");
      return [];
    }
    try {
      const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          part: "snippet",
          q: `${query} m\xFAsica cat\xF3lica lit\xFArgica`,
          type: "video",
          maxResults: 5,
          key: this.YOUTUBE_API_KEY
        }
      });
      const videos = response.data.items;
      const videoIds = videos.map((video) => video.id.videoId).join(",");
      const detailsResponse = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
        params: {
          part: "contentDetails,snippet",
          id: videoIds,
          key: this.YOUTUBE_API_KEY
        }
      });
      const videoDetails = detailsResponse.data.items;
      return videos.map((video) => {
        const details = videoDetails.find((d) => d.id === video.id.videoId);
        return {
          id: video.id.videoId,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
          channelTitle: video.snippet.channelTitle,
          duration: details?.contentDetails.duration || "",
          url: `https://www.youtube.com/watch?v=${video.id.videoId}`
        };
      });
    } catch (error) {
      console.error("Error searching YouTube:", error);
      return [];
    }
  }
  static generateCifrasGoianiaLink(musicName) {
    const searchTerm = musicName.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return `${this.CIFRAS_GOIANIA_BASE_URL}?search=${encodeURIComponent(searchTerm)}`;
  }
  static generateCnvMp3Link(youtubeUrl) {
    if (!youtubeUrl.includes("youtube.com/watch?v=") && !youtubeUrl.includes("youtu.be/")) {
      return "";
    }
    return `${this.CNV_MP3_BASE_URL}?url=${encodeURIComponent(youtubeUrl)}`;
  }
  static async searchMusic(query) {
    const youtubeResults = await this.searchYouTube(query);
    const cifrasLink = this.generateCifrasGoianiaLink(query);
    return {
      youtube: youtubeResults,
      cifrasGoiania: cifrasLink,
      cnvMp3Generator: this.CNV_MP3_BASE_URL
    };
  }
};

// server/routes.ts
async function registerRoutes(app2) {
  app2.use("/api/auth", authRouter);
  app2.get("/api/musicos", authenticateToken, async (req, res) => {
    try {
      const musicos2 = await storage.getMusicos();
      res.json(musicos2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch musicos" });
    }
  });
  app2.post("/api/musicos", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const musico = await storage.createMusico(req.body);
      res.json(musico);
    } catch (error) {
      res.status(500).json({ error: "Failed to create musico" });
    }
  });
  app2.put("/api/musicos/:id", async (req, res) => {
    try {
      const musico = await storage.updateMusico(req.params.id, req.body);
      res.json(musico);
    } catch (error) {
      res.status(500).json({ error: "Failed to update musico" });
    }
  });
  app2.delete("/api/musicos/:id", async (req, res) => {
    try {
      await storage.deleteMusico(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete musico" });
    }
  });
  app2.get("/api/missa-musicos/:missaId", authenticateToken, async (req, res) => {
    try {
      const musicosEscalados = await storage.getMissaMusicos(req.params.missaId);
      res.json(musicosEscalados);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch missa musicos" });
    }
  });
  app2.post("/api/missa-musicos", authenticateToken, async (req, res) => {
    try {
      const escalacao = await storage.createMissaMusico(req.body);
      res.json(escalacao);
    } catch (error) {
      res.status(500).json({ error: "Failed to create missa musico" });
    }
  });
  app2.delete("/api/missa-musicos/:id", authenticateToken, async (req, res) => {
    try {
      await storage.deleteMissaMusico(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete missa musico" });
    }
  });
  app2.get("/api/missas", async (req, res) => {
    try {
      const missas2 = await storage.getMissas();
      res.json(missas2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch missas" });
    }
  });
  app2.post("/api/missas", async (req, res) => {
    try {
      const missa = await storage.createMissa(req.body);
      res.json(missa);
    } catch (error) {
      res.status(500).json({ error: "Failed to create missa" });
    }
  });
  app2.put("/api/missas/:id", async (req, res) => {
    try {
      const missa = await storage.updateMissa(req.params.id, req.body);
      res.json(missa);
    } catch (error) {
      res.status(500).json({ error: "Failed to update missa" });
    }
  });
  app2.delete("/api/missas/:id", async (req, res) => {
    try {
      await storage.deleteMissa(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete missa" });
    }
  });
  app2.get("/api/missas/:id/musicas", async (req, res) => {
    try {
      const musicas2 = await storage.getMusicasByMissaId(req.params.id);
      res.json(musicas2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch musicas" });
    }
  });
  app2.post("/api/musicas", async (req, res) => {
    try {
      const musica = await storage.createMusica(req.body);
      res.json(musica);
    } catch (error) {
      res.status(500).json({ error: "Failed to create musica" });
    }
  });
  app2.delete("/api/musicas/:id", async (req, res) => {
    try {
      await storage.deleteMusica(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete musica" });
    }
  });
  app2.get("/api/biblioteca-musicas", async (req, res) => {
    try {
      const musicas2 = await storage.getBibliotecaMusicas();
      res.json(musicas2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch biblioteca musicas" });
    }
  });
  app2.post("/api/biblioteca-musicas", async (req, res) => {
    try {
      const musica = await storage.createBibliotecaMusica(req.body);
      res.json(musica);
    } catch (error) {
      res.status(500).json({ error: "Failed to create biblioteca musica" });
    }
  });
  app2.delete("/api/biblioteca-musicas/:id", async (req, res) => {
    try {
      await storage.deleteBibliotecaMusica(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete biblioteca musica" });
    }
  });
  app2.get("/api/musicos/:id/anotacoes", async (req, res) => {
    try {
      const anotacoes = await storage.getAnotacoesByMusicoId(req.params.id);
      res.json(anotacoes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch anotacoes" });
    }
  });
  app2.post("/api/musicos/:id/anotacoes", async (req, res) => {
    try {
      const anotacao = await storage.createAnotacao(req.params.id, req.body.texto);
      res.json(anotacao);
    } catch (error) {
      res.status(500).json({ error: "Failed to create anotacao" });
    }
  });
  app2.delete("/api/anotacoes/:id", async (req, res) => {
    try {
      await storage.deleteAnotacao(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete anotacao" });
    }
  });
  app2.get("/api/musicos/:id/sugestoes", async (req, res) => {
    try {
      const sugestoes = await storage.getSugestoesByMusicoId(req.params.id);
      res.json(sugestoes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sugestoes" });
    }
  });
  app2.post("/api/musicos/:id/sugestoes", async (req, res) => {
    try {
      const sugestao = await storage.createSugestao(req.params.id, req.body.texto);
      res.json(sugestao);
    } catch (error) {
      res.status(500).json({ error: "Failed to create sugestao" });
    }
  });
  app2.put("/api/sugestoes/:id", async (req, res) => {
    try {
      const sugestao = await storage.updateSugestaoStatus(req.params.id, req.body.status);
      res.json(sugestao);
    } catch (error) {
      res.status(500).json({ error: "Failed to update sugestao" });
    }
  });
  app2.get("/api/indisponibilidades", authenticateToken, async (req, res) => {
    try {
      const indisponibilidades = await storage.getIndisponibilidades();
      res.json(indisponibilidades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch indisponibilidades" });
    }
  });
  app2.get("/api/musicos/:id/indisponibilidades", authenticateToken, async (req, res) => {
    try {
      const indisponibilidades = await storage.getIndisponibilidadesByMusicoId(req.params.id);
      res.json(indisponibilidades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch indisponibilidades" });
    }
  });
  app2.post("/api/indisponibilidades", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const indisponibilidade = await storage.createIndisponibilidade(req.body);
      res.json(indisponibilidade);
    } catch (error) {
      res.status(500).json({ error: "Failed to create indisponibilidade" });
    }
  });
  app2.put("/api/indisponibilidades/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const indisponibilidade = await storage.updateIndisponibilidade(req.params.id, req.body);
      res.json(indisponibilidade);
    } catch (error) {
      res.status(500).json({ error: "Failed to update indisponibilidade" });
    }
  });
  app2.delete("/api/indisponibilidades/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deleteIndisponibilidade(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete indisponibilidade" });
    }
  });
  app2.get("/api/analytics", authenticateToken, async (req, res) => {
    try {
      const missas2 = await storage.getMissas();
      const musicos2 = await storage.getMusicos();
      const bibliotecaMusicas2 = await storage.getBibliotecaMusicas();
      const missasPorMes = [];
      for (let i = 5; i >= 0; i--) {
        const date2 = /* @__PURE__ */ new Date();
        date2.setMonth(date2.getMonth() - i);
        const mes = date2.toLocaleDateString("pt-BR", { month: "short" });
        const quantidade = missas2.filter((m) => {
          const missaDate = new Date(m.data);
          return missaDate.getMonth() === date2.getMonth() && missaDate.getFullYear() === date2.getFullYear();
        }).length;
        missasPorMes.push({ mes, quantidade });
      }
      const musicosMaisAtuantes = musicos2.slice(0, 5).map((m) => ({
        nome: m.nome,
        participacoes: Math.floor(Math.random() * 25) + 5
      }));
      const sugestoesPorStatus = [
        { status: "Pendente", count: 3, color: "#FFBB28" },
        { status: "Aprovada", count: 8, color: "#00C49F" },
        { status: "Recusada", count: 2, color: "#FF8042" }
      ];
      const musicasMaisUsadas = bibliotecaMusicas2.slice(0, 5).map((m) => ({
        nome: m.nome,
        usos: Math.floor(Math.random() * 15) + 1,
        cantor: m.cantor
      }));
      const disponibilidadeCoral = [
        { dia: "Dom", disponivel: Math.floor(Math.random() * 3) + 7, total: musicos2.length },
        { dia: "Seg", disponivel: Math.floor(Math.random() * 2) + 2, total: musicos2.length },
        { dia: "Ter", disponivel: Math.floor(Math.random() * 3) + 3, total: musicos2.length },
        { dia: "Qua", disponivel: Math.floor(Math.random() * 4) + 4, total: musicos2.length },
        { dia: "Qui", disponivel: Math.floor(Math.random() * 3) + 4, total: musicos2.length },
        { dia: "Sex", disponivel: Math.floor(Math.random() * 2) + 3, total: musicos2.length },
        { dia: "S\xE1b", disponivel: Math.floor(Math.random() * 3) + 5, total: musicos2.length }
      ];
      const partesCarentes = [
        { parte: "Entrada", preenchimento: Math.floor(Math.random() * 40) + 60 },
        { parte: "Kyrie", preenchimento: Math.floor(Math.random() * 40) + 40 },
        { parte: "Gloria", preenchimento: Math.floor(Math.random() * 30) + 60 },
        { parte: "Aclama\xE7\xE3o", preenchimento: Math.floor(Math.random() * 50) + 30 },
        { parte: "Ofert\xF3rio", preenchimento: Math.floor(Math.random() * 20) + 70 },
        { parte: "Sanctus", preenchimento: Math.floor(Math.random() * 40) + 40 },
        { parte: "Comunh\xE3o", preenchimento: Math.floor(Math.random() * 30) + 60 },
        { parte: "Sa\xEDda", preenchimento: Math.floor(Math.random() * 30) + 50 }
      ].map((p) => ({ ...p, total: 100 }));
      const analytics = {
        missasPorMes,
        musicosMaisAtuantes,
        sugestoesPorStatus,
        musicasMaisUsadas,
        disponibilidadeCoral,
        partesCarentes
      };
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/search/music", authenticateToken, async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }
      const results = await MusicSearchService.searchMusic(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to search music" });
    }
  });
  app2.post("/api/search/youtube-to-mp3", authenticateToken, async (req, res) => {
    try {
      const { youtubeUrl } = req.body;
      if (!youtubeUrl) {
        return res.status(400).json({ error: "YouTube URL is required" });
      }
      const mp3Link = MusicSearchService.generateCnvMp3Link(youtubeUrl);
      res.json({ mp3Link });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate MP3 link" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var base = process.env.NODE_ENV === "production" ? "/musicas/" : "/";
var vite_config_default = defineConfig({
  base,
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    port: 5173,
    strictPort: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/seedDatabase.ts
import { eq as eq4 } from "drizzle-orm";
async function seedDatabase() {
  try {
    const existingAdmin = await db.select().from(authUsers2).where(eq4(authUsers2.tipo, "admin")).limit(1);
    if (existingAdmin.length === 0) {
      const adminPassword = "88928883";
      const hashedPassword = await hashPassword(adminPassword);
      await db.insert(authUsers2).values({
        email: "wijosi59@gmail.com",
        password: hashedPassword,
        nome: "Administrador",
        tipo: "admin",
        ativo: true
      });
      console.log("\u2705 Administrador inicial criado:");
      console.log("\u{1F4E7} Email: wijosi59@gmail.com");
      console.log("\u{1F511} Senha: 88928883");
      console.log("\u26A0\uFE0F  IMPORTANTE: Altere esta senha ap\xF3s o primeiro login!");
    }
    const existingMusico = await db.select().from(authUsers2).where(eq4(authUsers2.tipo, "musico")).limit(1);
    if (existingMusico.length === 0) {
      const musicoPassword = "musico123";
      const hashedPassword = await hashPassword(musicoPassword);
      await db.insert(authUsers2).values({
        email: "musico@paroquiaboaviagem.com",
        password: hashedPassword,
        nome: "M\xFAsico Exemplo",
        tipo: "musico",
        instrumento: "Viol\xE3o",
        telefone: "(31) 99999-9999",
        ativo: true
      });
      console.log("\u2705 M\xFAsico exemplo criado:");
      console.log("\u{1F4E7} Email: musico@paroquiaboaviagem.com");
      console.log("\u{1F511} Senha: musico123");
    }
  } catch (error) {
    console.error("\u274C Erro ao criar dados iniciais:", error);
  }
}

// server/index.ts
var app = express2();
(async () => {
  try {
    await seedDatabase();
    console.log("\u2705 Seed do banco de dados conclu\xEDdo com sucesso");
  } catch (error) {
    console.error("\u274C Erro ao executar o seed do banco de dados:", error);
  }
})();
var allowedOrigins = process.env.NODE_ENV === "production" ? ["https://seusite.com"] : [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  // Frontend Vite
  "http://localhost:5000",
  // Backend local
  "http://127.0.0.1:5000"
  // Backend local
];
console.log("Origins permitidos pelo CORS:", allowedOrigins);
var corsOptions = {
  origin: function(origin, callback) {
    console.log("Solicita\xE7\xE3o recebida de origem:", origin);
    if (!origin) {
      console.log("Origem n\xE3o definida, permitindo requisi\xE7\xE3o");
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      console.log("Origem permitida:", origin);
      return callback(null, true);
    }
    console.warn("Origem n\xE3o permitida:", origin);
    return callback(new Error("Acesso n\xE3o permitido por CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Authorization"],
  credentials: true,
  maxAge: 86400,
  // 24 horas
  preflightContinue: false,
  optionsSuccessStatus: 204
};
console.log("Aplicando middleware CORS...");
app.use(cors(corsOptions));
app.use((req, res, next) => {
  console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] ${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params
  });
  next();
});
app.use(express2.json());
app.use(express2.urlencoded({ extended: true }));
console.log("Configurando tratamento para requisi\xE7\xF5es OPTIONS...");
app.options("*", cors(corsOptions));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
  }
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "127.0.0.1";
  server.listen({
    port,
    host,
    reuseAddress: true
  }, () => {
    log(`Servidor rodando em http://${host}:${port}`);
  }).on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      log(`Erro: A porta ${port} j\xE1 est\xE1 em uso.`);
      log("Por favor, feche outros servidores ou especifique outra porta.");
    } else if (error.code === "EACCES") {
      log(`Erro: Permiss\xE3o negada para acessar a porta ${port}.`);
      log("Tente usar uma porta acima de 1024 ou execute como administrador.");
    } else {
      log(`Erro ao iniciar o servidor: ${error.message}`);
    }
    process.exit(1);
  });
})();
