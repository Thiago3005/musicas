import { Router } from 'express';
import { db } from './db';
import { authUsers } from '../shared/authSchema';
import { eq } from 'drizzle-orm';
import { 
  hashPassword, 
  verifyPassword, 
  createUserSession, 
  authenticateToken, 
  requireAdmin,
  generatePasswordResetToken,
  validatePasswordResetToken,
  markPasswordResetTokenAsUsed,
  logoutUser,
  type AuthenticatedRequest 
} from './auth';

const authRouter = Router();

// Login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const user = await db
      .select()
      .from(authUsers)
      .where(eq(authUsers.email, email))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const userData = user[0];

    if (!userData.ativo) {
      return res.status(401).json({ error: 'Usuário desativado' });
    }

    // Verificar senha
    const passwordValid = await verifyPassword(password, userData.password);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Criar sessão
    const sessionToken = await createUserSession(userData.id);

    // Retornar dados do usuário (sem senha)
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
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logout
authRouter.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await logoutUser(token);
    }

    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar autenticação
authRouter.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

// Solicitar recuperação de senha
authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const resetToken = await generatePasswordResetToken(email);
    
    if (resetToken) {
      // Aqui você implementaria o envio de email
      // Por enquanto, apenas retornamos sucesso
      console.log(`Token de recuperação para ${email}: ${resetToken}`);
    }

    // Sempre retorna sucesso por segurança
    res.json({ message: 'Se o email existir, você receberá instruções de recuperação' });

  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Redefinir senha
authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    const userId = await validatePasswordResetToken(token);
    if (!userId) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    // Atualizar senha
    const hashedPassword = await hashPassword(newPassword);
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Marcar token como usado
    await markPasswordResetTokenAsUsed(token);

    res.json({ message: 'Senha redefinida com sucesso' });

  } catch (error) {
    console.error('Erro na redefinição de senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ROTAS DE GERENCIAMENTO DE USUÁRIOS (apenas admins)

// Listar usuários
authRouter.get('/users', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const allUsers = await db
      .select({
        id: authUsers.id,
        email: authUsers.email,
        nome: authUsers.nome,
        tipo: authUsers.tipo,
        instrumento: authUsers.instrumento,
        telefone: authUsers.telefone,
        foto: authUsers.foto,
        ativo: authUsers.ativo,
        createdAt: authUsers.createdAt
      })
      .from(authUsers)
      .orderBy(authUsers.nome);

    res.json(allUsers);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar usuário
authRouter.post('/users', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { email, password, nome, tipo, instrumento, telefone, foto } = req.body;

    if (!email || !password || !nome || !tipo) {
      return res.status(400).json({ error: 'Email, senha, nome e tipo são obrigatórios' });
    }

    if (!['admin', 'musico'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo deve ser "admin" ou "musico"' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    // Verificar se email já existe
    const existingUser = await db
      .select()
      .from(authUsers)
      .where(eq(authUsers.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    // Criar usuário
    const hashedPassword = await hashPassword(password);
    const newUser = await db
      .insert(authUsers)
      .values({
        email,
        password: hashedPassword,
        nome,
        tipo,
        instrumento: tipo === 'musico' ? instrumento : null,
        telefone,
        foto
      })
      .returning();

    // Retornar sem senha
    const { password: _, ...userResponse } = newUser[0];
    res.status(201).json(userResponse);

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar usuário
authRouter.put('/users/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { email, nome, tipo, instrumento, telefone, foto, ativo, newPassword } = req.body;

    const updateData: any = {
      email,
      nome,
      tipo,
      instrumento: tipo === 'musico' ? instrumento : null,
      telefone,
      foto,
      ativo,
      updatedAt: new Date()
    };

    // Se nova senha foi fornecida
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
      }
      updateData.password = await hashPassword(newPassword);
    }

    const updatedUser = await db
      .update(authUsers)
      .set(updateData)
      .where(eq(authUsers.id, id))
      .returning();

    if (updatedUser.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Retornar sem senha
    const { password: _, ...userResponse } = updatedUser[0];
    res.json(userResponse);

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar usuário
authRouter.delete('/users/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Verificar se não é o próprio usuário
    if (req.user?.id === id) {
      return res.status(400).json({ error: 'Não é possível deletar seu próprio usuário' });
    }

    const deletedUser = await db
      .delete(authUsers)
      .where(eq(authUsers.id, id))
      .returning();

    if (deletedUser.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export { authRouter };