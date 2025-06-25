import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { authUsers, userSessions, passwordResetTokens } from '../shared/authSchema';
import { eq, and, gt } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutos

export interface AuthenticatedUser {
  id: string;
  email: string;
  nome: string;
  tipo: 'admin' | 'musico';
  instrumento?: string;
  telefone?: string;
  foto?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Gerar hash da senha
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verificar senha
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Gerar token JWT
export function generateJWT(user: AuthenticatedUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '30m' });
}

// Verificar token JWT
export function verifyJWT(token: string): AuthenticatedUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
  } catch {
    return null;
  }
}

// Criar sessão de usuário
export async function createUserSession(userId: string): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await db.insert(userSessions).values({
    userId,
    token: sessionToken,
    expiresAt,
    lastActivity: new Date()
  });

  return sessionToken;
}

// Validar sessão
export async function validateSession(sessionToken: string): Promise<AuthenticatedUser | null> {
  const session = await db
    .select()
    .from(userSessions)
    .where(
      and(
        eq(userSessions.token, sessionToken),
        gt(userSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (session.length === 0) {
    return null;
  }

  // Atualizar última atividade
  await db
    .update(userSessions)
    .set({ 
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + SESSION_DURATION)
    })
    .where(eq(userSessions.id, session[0].id));

  // Buscar dados do usuário
  const user = await db
    .select()
    .from(authUsers)
    .where(eq(authUsers.id, session[0].userId))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  const userData = user[0];
  return {
    id: userData.id,
    email: userData.email,
    nome: userData.nome,
    tipo: userData.tipo as 'admin' | 'musico',
    instrumento: userData.instrumento || undefined,
    telefone: userData.telefone || undefined,
    foto: userData.foto || undefined
  };
}

// Middleware de autenticação
export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  console.log('[authenticateToken] Iniciando validação de token');
  const authHeader = req.headers['authorization'];
  console.log('[authenticateToken] Authorization header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  console.log('[authenticateToken] Token extraído:', token ? `${token.substring(0, 10)}...` : 'Nenhum token encontrado');

  if (!token) {
    console.error('[authenticateToken] Erro: Nenhum token fornecido');
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    console.log('[authenticateToken] Validando token...');
    const user = await validateSession(token);
    
    if (!user) {
      console.error('[authenticateToken] Erro: Token inválido ou expirado');
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    console.log(`[authenticateToken] Token válido para usuário: ${user.email} (${user.id})`);
    req.user = user;
    next();
  } catch (error) {
    console.error('[authenticateToken] Erro ao validar token:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
}

// Middleware para verificar se é admin
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  if (req.user.tipo !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }

  next();
}

// Gerar token de recuperação de senha
export async function generatePasswordResetToken(email: string): Promise<string | null> {
  const user = await db
    .select()
    .from(authUsers)
    .where(eq(authUsers.email, email))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await db.insert(passwordResetTokens).values({
    userId: user[0].id,
    token: resetToken,
    expiresAt
  });

  return resetToken;
}

// Validar token de recuperação
export async function validatePasswordResetToken(token: string): Promise<string | null> {
  const resetToken = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (resetToken.length === 0) {
    return null;
  }

  return resetToken[0].userId;
}

// Marcar token como usado
export async function markPasswordResetTokenAsUsed(token: string): Promise<void> {
  await db
    .update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.token, token));
}

// Logout (invalidar sessão)
export async function logoutUser(sessionToken: string): Promise<void> {
  await db
    .delete(userSessions)
    .where(eq(userSessions.token, sessionToken));
}

// Limpar sessões expiradas
export async function cleanExpiredSessions(): Promise<void> {
  await db
    .delete(userSessions)
    .where(gt(userSessions.expiresAt, new Date()));
}