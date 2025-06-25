import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  nome: string;
  tipo: 'admin' | 'musico';
  instrumento?: string;
  telefone?: string;
  foto?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    console.log('AuthProvider: Efeito de verificação de autenticação acionado');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('AuthProvider: Verificando autenticação...');
    try {
      const token = localStorage.getItem('authToken');
      console.log('AuthProvider: Token encontrado no localStorage:', token ? 'SIM' : 'NÃO');
      
      if (!token) {
        console.log('AuthProvider: Nenhum token encontrado, usuário não autenticado');
        setLoading(false);
        return;
      }

      console.log('AuthProvider: Verificando token com o servidor...');
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('AuthProvider: Token válido, usuário autenticado:', data.user.email);
        setUser(data.user);
      } else {
        // Token inválido, remover
        console.error('AuthProvider: Token inválido ou expirado, removendo do localStorage');
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('AuthProvider: Erro ao verificar autenticação:', error);
      localStorage.removeItem('authToken');
    } finally {
      console.log('AuthProvider: Finalizando verificação de autenticação');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Iniciando login para:', email);
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('AuthProvider: Erro na resposta do login:', error);
        throw new Error(error.error || 'Erro no login');
      }

      const data = await response.json();
      console.log('AuthProvider: Resposta do login recebida:', { 
        hasToken: !!data.token, 
        tokenLength: data.token ? data.token.length : 0,
        user: data.user 
      });
      
      if (!data.token) {
        console.error('AuthProvider: Nenhum token recebido na resposta do login');
        throw new Error('Nenhum token de autenticação recebido');
      }
      
      // Salvar token
      console.log('AuthProvider: Salvando token no localStorage...');
      localStorage.setItem('authToken', data.token);
      
      // Verificar se o token foi salvo corretamente
      const savedToken = localStorage.getItem('authToken');
      console.log('AuthProvider: Token salvo no localStorage com sucesso:', 
        savedToken ? `SIM (${savedToken.length} caracteres)` : 'NÃO');
        
      console.log('AuthProvider: Atualizando estado do usuário...');
      setUser(data.user);
      console.log('AuthProvider: Estado do usuário atualizado:', data.user.email);
      
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.tipo === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}