import { pgTable, varchar, boolean, timestamp, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Tabela de usuários para autenticação
export const authUsers = pgTable("auth_users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 20 }).notNull(), // 'admin' ou 'musico'
  instrumento: varchar("instrumento", { length: 100 }),
  telefone: varchar("telefone", { length: 20 }),
  foto: text("foto"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para tokens de recuperação de senha
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela para sessões de usuário
export const userSessions = pgTable("user_sessions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AuthUser = typeof authUsers.$inferSelect;
export type InsertAuthUser = typeof authUsers.$inferInsert;