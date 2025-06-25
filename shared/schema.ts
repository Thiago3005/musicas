import { pgTable, text, serial, integer, boolean, uuid, timestamp, date, time, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Auth tables
export const authUsers = pgTable("auth_users", {
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const musicos = pgTable("musicos", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  funcao: text("funcao").notNull(),
  disponivel: boolean("disponivel").notNull().default(true),
  email: text("email"),
  telefone: text("telefone"),
  foto: text("foto"),
  observacoes_permanentes: text("observacoes_permanentes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const musicoAnotacoes = pgTable("musico_anotacoes", {
  id: uuid("id").defaultRandom().primaryKey(),
  musico_id: uuid("musico_id").references(() => musicos.id, { onDelete: "cascade" }).notNull(),
  texto: text("texto").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const musicoSugestoes = pgTable("musico_sugestoes", {
  id: uuid("id").defaultRandom().primaryKey(),
  musico_id: uuid("musico_id").references(() => musicos.id, { onDelete: "cascade" }).notNull(),
  texto: text("texto").notNull(),
  status: text("status").notNull().default("pendente"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Tabela de indisponibilidade dos músicos
export const musicoIndisponibilidade = pgTable("musico_indisponibilidade", {
  id: uuid("id").defaultRandom().primaryKey(),
  musico_id: uuid("musico_id").references(() => musicos.id, { onDelete: "cascade" }).notNull(),
  data_inicio: date("data_inicio").notNull(),
  data_fim: date("data_fim").notNull(),
  motivo: text("motivo").notNull(), // ferias, compromisso_pessoal, outro
  motivo_outro: text("motivo_outro"), // para quando motivo = 'outro'
  observacoes: text("observacoes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const missas = pgTable("missas", {
  id: uuid("id").defaultRandom().primaryKey(),
  data: date("data").notNull(),
  horario: time("horario").notNull(),
  tipo: text("tipo").notNull(),
  observacoes: text("observacoes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const missaMusicos = pgTable("missa_musicos", {
  id: uuid("id").defaultRandom().primaryKey(),
  missa_id: uuid("missa_id").references(() => missas.id, { onDelete: "cascade" }).notNull(),
  musico_id: uuid("musico_id").references(() => musicos.id, { onDelete: "cascade" }).notNull(),
  parte_missa: text("parte_missa").notNull(), // entrada, kyrie, gloria, aclamacao, ofertorio, sanctus, comunhao, saida
  funcao: text("funcao").notNull().default("vocal"), // vocal, backvocal, instrumental, solista
  instrumento: text("instrumento"), // violao, piano, flauta, etc
  observacoes: text("observacoes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const musicas = pgTable("musicas", {
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
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bibliotecaMusicas = pgTable("biblioteca_musicas", {
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
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMusicoSchema = createInsertSchema(musicos);
export const insertMissaSchema = createInsertSchema(missas);
export const insertMusicaSchema = createInsertSchema(musicas);
export const insertBibliotecaMusicaSchema = createInsertSchema(bibliotecaMusicas);
export const insertMusicoIndisponibilidadeSchema = createInsertSchema(musicoIndisponibilidade);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Musico = typeof musicos.$inferSelect;
export type InsertMusico = z.infer<typeof insertMusicoSchema>;
export type Missa = typeof missas.$inferSelect;
export type InsertMissa = z.infer<typeof insertMissaSchema>;
export type Musica = typeof musicas.$inferSelect;
export type InsertMusica = z.infer<typeof insertMusicaSchema>;
export type BibliotecaMusica = typeof bibliotecaMusicas.$inferSelect;
export type InsertBibliotecaMusica = z.infer<typeof insertBibliotecaMusicaSchema>;
export type MusicoIndisponibilidade = typeof musicoIndisponibilidade.$inferSelect;
export type InsertMusicoIndisponibilidade = z.infer<typeof insertMusicoIndisponibilidadeSchema>;
