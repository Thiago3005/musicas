import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Edit, Trash2, UserCheck, UserX, Shield, Music } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  nome: string;
  tipo: 'admin' | 'musico';
  instrumento?: string;
  telefone?: string;
  foto?: string;
  ativo: boolean;
  createdAt: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
    tipo: 'musico' as 'admin' | 'musico',
    instrumento: '',
    telefone: '',
    foto: '',
    ativo: true,
    newPassword: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      const url = editingUser 
        ? `/api/auth/users/${editingUser.id}`
        : '/api/auth/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const payload = { ...formData };
      if (editingUser && !formData.newPassword) {
        delete payload.newPassword;
      }
      if (editingUser) {
        payload.password = formData.newPassword;
        delete payload.newPassword;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: `Usuário ${editingUser ? 'atualizado' : 'criado'} com sucesso!`
        });
        
        resetForm();
        fetchUsers();
      } else {
        const error = await response.json();
        toast({
          title: 'Erro',
          description: error.error || 'Erro ao salvar usuário',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar usuário',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      email: user.email,
      password: '',
      nome: user.nome,
      tipo: user.tipo,
      instrumento: user.instrumento || '',
      telefone: user.telefone || '',
      foto: user.foto || '',
      ativo: user.ativo,
      newPassword: ''
    });
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este usuário?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Usuário excluído com sucesso!'
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir usuário',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      nome: '',
      tipo: 'musico',
      instrumento: '',
      telefone: '',
      foto: '',
      ativo: true,
      newPassword: ''
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'admin' ? <Shield className="h-4 w-4" /> : <Music className="h-4 w-4" />;
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gerenciar Usuários
          </h1>
          <p className="text-gray-600 mt-1">Administre admins e músicos do sistema</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800">
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo de Usuário *</Label>
                  <Select value={formData.tipo} onValueChange={(value: 'admin' | 'musico') => setFormData({...formData, tipo: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="musico">Músico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.tipo === 'musico' && (
                  <div>
                    <Label htmlFor="instrumento">Instrumento</Label>
                    <Input
                      id="instrumento"
                      value={formData.instrumento}
                      onChange={(e) => setFormData({...formData, instrumento: e.target.value})}
                      placeholder="Ex: Violão, Piano, Canto..."
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {editingUser ? (
                  <div>
                    <Label htmlFor="newPassword">Nova Senha (deixe vazio para manter)</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      placeholder="Nova senha (opcional)"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required={!editingUser}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    placeholder="(XX) XXXXX-XXXX"
                  />
                </div>
              </div>

              {editingUser && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                  />
                  <Label htmlFor="ativo">Usuário ativo</Label>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">
                  {editingUser ? 'Atualizar' : 'Criar'} Usuário
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Carregando usuários...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum usuário cadastrado
            </p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{user.nome}</h4>
                      <Badge className={getTipoColor(user.tipo)}>
                        <span className="flex items-center gap-1">
                          {getTipoIcon(user.tipo)}
                          {user.tipo === 'admin' ? 'Administrador' : 'Músico'}
                        </span>
                      </Badge>
                      {user.ativo ? (
                        <Badge className="bg-green-100 text-green-800">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <UserX className="h-3 w-3 mr-1" />
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.instrumento && (
                      <p className="text-sm text-gray-500">Instrumento: {user.instrumento}</p>
                    )}
                    {user.telefone && (
                      <p className="text-sm text-gray-500">Telefone: {user.telefone}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}