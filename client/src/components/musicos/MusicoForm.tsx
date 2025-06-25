
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SupabaseMusico } from '../../hooks/useApi';

interface MusicoFormProps {
  musico?: any; // Mantendo compatibilidade com formato antigo
  onSave: (musico: Omit<SupabaseMusico, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export function MusicoForm({ musico, onSave, onCancel }: MusicoFormProps) {
  const [formData, setFormData] = useState({
    nome: musico?.nome || '',
    funcao: musico?.funcao || '',
    disponivel: musico?.disponivel ?? true,
    email: musico?.contato?.email || musico?.email || '',
    telefone: musico?.contato?.telefone || musico?.telefone || '',
    observacoes_permanentes: musico?.observacoesPermanentes || musico?.observacoes_permanentes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const funcoesMusicais = [
    'Violão',
    'Teclado/Piano',
    'Voz Principal',
    'Backing Vocal',
    'Cajón',
    'Bateria',
    'Baixo',
    'Flauta',
    'Violino',
    'Coordenador Musical',
    'Outro'
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{musico ? 'Editar Músico' : 'Novo Músico'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="funcao">Função Musical</Label>
            <Input
              id="funcao"
              value={formData.funcao}
              onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
              list="funcoes"
              required
            />
            <datalist id="funcoes">
              {funcoesMusicais.map((funcao) => (
                <option key={funcao} value={funcao} />
              ))}
            </datalist>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="disponivel"
              checked={formData.disponivel}
              onCheckedChange={(checked) => setFormData({ ...formData, disponivel: Boolean(checked) })}
            />
            <Label htmlFor="disponivel">Disponível para próximas missas</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">E-mail (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone (opcional)</Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações Permanentes</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes_permanentes}
              onChange={(e) => setFormData({ ...formData, observacoes_permanentes: e.target.value })}
              placeholder="Ex: Prefere músicas com cifras simplificadas, toca melhor em tom de G..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {musico ? 'Atualizar' : 'Criar'} Músico
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
