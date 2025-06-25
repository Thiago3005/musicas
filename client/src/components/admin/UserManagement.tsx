import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  nome: string;
  tipo: 'admin' | 'musico';
  instrumento?: string;
  telefone?: string;
  ativo: boolean;
  createdAt: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { get, post, put, delete: del } = useApi();

  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    password: '',
    tipo: 'musico' as 'admin' | 'musico',
    instrumento: '',
    telefone: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await get('/auth/users');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const { password, ...updateData } = formData;
        const updatedUser = await put(`/auth/users/${editingUser.id}`, {
          ...updateData,
          ...(password && { password })
        });
        setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
        toast.success('Usuário atualizado com sucesso');
      } else {
        const newUser = await post('/auth/users', formData);
        setUsers(prev => [...prev, newUser]);
        toast.success('Usuário criado com sucesso');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Erro ao salvar usuário');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await del(`/auth/users/${id}`);
        setUsers(prev => prev.filter(u => u.id !== id));
        toast.success('Usuário excluído com sucesso');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Erro ao excluir usuário');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      nome: '',
      password: '',
      tipo: 'musico',
      instrumento: '',
      telefone: ''
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleEdit = (user: User) => {
    setFormData({
      email: user.email,
      nome: user.nome,
      password: '',
      tipo: user.tipo,
      instrumento: user.instrumento || '',
      telefone: user.telefone || ''
    });
    setEditingUser(user);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando usuários...</div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                      {user.ativo ? (
                        <UserCheck className="h-5 w-5 text-blue-600" />
                      ) : (
                        <UserX className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{user.nome}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.telefone && (
                        <p className="text-sm text-gray-600">{user.telefone}</p>
                      )}
                      {user.instrumento && (
                        <p className="text-sm text-gray-600">{user.instrumento}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.tipo === 'admin' ? 'default' : 'secondary'}>
                      {user.tipo}
                    </Badge>
                    <Badge variant={user.ativo ? 'outline' : 'destructive'}>
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
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

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">
                {editingUser ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
            </div>
            
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={formData.tipo} onValueChange={(value: 'admin' | 'musico') => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="musico">Músico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>
            
            {formData.tipo === 'musico' && (
              <div>
                <Label htmlFor="instrumento">Instrumento</Label>
                <Input
                  id="instrumento"
                  value={formData.instrumento}
                  onChange={(e) => setFormData({ ...formData, instrumento: e.target.value })}
                />
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingUser ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}