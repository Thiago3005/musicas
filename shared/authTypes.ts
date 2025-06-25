// Tipos relacionados à autenticação
export interface User {
  id: string;
  email: string;
  nome: string;
  tipo: 'admin' | 'musico';
  instrumento?: string;
  telefone?: string;
  foto?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  token: string;
  message: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}