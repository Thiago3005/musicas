
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SupabaseMissa } from '../../hooks/useApi';

interface MissaFormProps {
  missa?: any; // Mantendo compatibilidade com formato antigo
  onSave: (missa: Omit<SupabaseMissa, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export function MissaForm({ missa, onSave, onCancel }: MissaFormProps) {
  const [formData, setFormData] = useState({
    data: missa?.data || '',
    horario: missa?.horario || '',
    tipo: missa?.tipo || '',
    observacoes: missa?.observacoes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tiposMissa = [
    'Domingo - Manhã',
    'Domingo - Tarde',
    'Domingo - Noite',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Festa Especial',
    'Casamento',
    'Funeral',
    'Batizado',
    'Primeira Comunhão',
    'Crisma'
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{missa ? 'Editar Missa' : 'Nova Missa'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="horario">Horário</Label>
              <Input
                id="horario"
                type="time"
                value={formData.horario}
                onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tipo">Tipo de Missa</Label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de missa" />
              </SelectTrigger>
              <SelectContent>
                {tiposMissa.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações especiais para esta missa..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {missa ? 'Atualizar' : 'Criar'} Missa
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
