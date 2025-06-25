import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Edit, Trash2, CalendarDays, UserX } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Musico {
  id: string;
  nome: string;
  funcao: string;
  disponivel: boolean;
}

interface Indisponibilidade {
  id: string;
  musico_id: string;
  data_inicio: string;
  data_fim: string;
  motivo: 'ferias' | 'compromisso_pessoal' | 'outro';
  motivo_outro?: string;
  observacoes?: string;
  created_at: string;
}

const MOTIVOS = {
  ferias: 'Férias',
  compromisso_pessoal: 'Compromisso Pessoal',
  outro: 'Outro'
};

export function DisponibilidadeManager() {
  const [musicos, setMusicos] = useState<Musico[]>([]);
  const [indisponibilidades, setIndisponibilidades] = useState<Indisponibilidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Indisponibilidade | null>(null);
  const [selectedMusicoId, setSelectedMusicoId] = useState<string>('todos');
  const { get, post, put, delete: del } = useApi();

  const [formData, setFormData] = useState({
    musicoId: '',
    dataInicio: '',
    dataFim: '',
    motivo: 'ferias' as 'ferias' | 'compromisso_pessoal' | 'outro',
    motivoOutro: '',
    observacoes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [musicosData, indisponibilidadesData] = await Promise.all([
        get('/musicos'),
        get('/indisponibilidades')
      ]);
      setMusicos(musicosData);
      setIndisponibilidades(indisponibilidadesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        musico_id: formData.musicoId,
        data_inicio: formData.dataInicio,
        data_fim: formData.dataFim || formData.dataInicio,
        motivo: formData.motivo,
        motivo_outro: formData.motivoOutro,
        observacoes: formData.observacoes
      };

      if (editingItem) {
        const updated = await put(`/indisponibilidades/${editingItem.id}`, dataToSend);
        setIndisponibilidades(prev => prev.map(item => 
          item.id === editingItem.id ? updated : item
        ));
        toast.success('Indisponibilidade atualizada com sucesso');
      } else {
        const newItem = await post('/indisponibilidades', dataToSend);
        setIndisponibilidades(prev => [...prev, newItem]);
        toast.success('Indisponibilidade registrada com sucesso');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving indisponibilidade:', error);
      toast.error('Erro ao salvar indisponibilidade');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta indisponibilidade?')) {
      try {
        await del(`/indisponibilidades/${id}`);
        setIndisponibilidades(prev => prev.filter(item => item.id !== id));
        toast.success('Indisponibilidade excluída com sucesso');
      } catch (error) {
        console.error('Error deleting indisponibilidade:', error);
        toast.error('Erro ao excluir indisponibilidade');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      musicoId: '',
      dataInicio: '',
      dataFim: '',
      motivo: 'ferias',
      motivoOutro: '',
      observacoes: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: Indisponibilidade) => {
    setFormData({
      musicoId: item.musico_id,
      dataInicio: item.data_inicio,
      dataFim: item.data_fim,
      motivo: item.motivo,
      motivoOutro: item.motivo_outro || '',
      observacoes: item.observacoes || ''
    });
    setEditingItem(item);
    setShowForm(true);
  };

  const getMusicoNome = (musicoId: string) => {
    const musico = musicos.find(m => m.id === musicoId);
    return musico ? musico.nome : 'Músico não encontrado';
  };

  const getIndisponibilidadesPorMusico = (musicoId: string) => {
    return indisponibilidades.filter(item => item.musico_id === musicoId);
  };

  const formatDateRange = (dataInicio: string, dataFim: string) => {
    const inicio = parseISO(dataInicio);
    const fim = parseISO(dataFim);
    
    if (dataInicio === dataFim) {
      return format(inicio, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
    
    return `${format(inicio, "dd 'de' MMMM", { locale: ptBR })} a ${format(fim, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
  };

  const isMusicicoIndisponivel = (musicoId: string, data: Date) => {
    return indisponibilidades.some(item => {
      if (item.musico_id !== musicoId) return false;
      
      const inicio = parseISO(item.data_inicio);
      const fim = parseISO(item.data_fim);
      
      return isWithinInterval(data, { start: inicio, end: fim });
    });
  };

  const filteredIndisponibilidades = selectedMusicoId && selectedMusicoId !== 'todos'
    ? indisponibilidades.filter(item => item.musico_id === selectedMusicoId)
    : indisponibilidades;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Controle de Disponibilidade</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Indisponibilidade
        </Button>
      </div>

      {/* Filtro por músico */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Filtrar por músico:</Label>
              <Select value={selectedMusicoId} onValueChange={setSelectedMusicoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os músicos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os músicos</SelectItem>
                  {musicos.map((musico) => (
                    <SelectItem key={musico.id} value={musico.id}>
                      {musico.nome} - {musico.funcao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de indisponibilidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Indisponibilidades Registradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredIndisponibilidades.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma indisponibilidade encontrada
              </h3>
              <p className="text-gray-600">
                {selectedMusicoId && selectedMusicoId !== 'todos'
                  ? 'Este músico não possui indisponibilidades registradas'
                  : 'Nenhuma indisponibilidade foi registrada ainda'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIndisponibilidades.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{getMusicoNome(item.musico_id)}</h3>
                      <Badge variant="outline">
                        {MOTIVOS[item.motivo]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateRange(item.data_inicio, item.data_fim)}</span>
                    </div>
                    {item.motivo === 'outro' && item.motivo_outro && (
                      <p className="text-sm text-gray-600 mt-1">
                        Motivo: {item.motivo_outro}
                      </p>
                    )}
                    {item.observacoes && (
                      <p className="text-sm text-gray-500 italic mt-1">
                        {item.observacoes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
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

      {/* Resumo por músico */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Músico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {musicos.map((musico) => {
              const indisponibilidadesDoMusico = getIndisponibilidadesPorMusico(musico.id);
              return (
                <div key={musico.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{musico.nome}</h4>
                  <p className="text-sm text-gray-600 mb-2">{musico.funcao}</p>
                  <Badge variant={indisponibilidadesDoMusico.length === 0 ? 'default' : 'secondary'}>
                    {indisponibilidadesDoMusico.length} indisponibilidade(s)
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Formulário */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Indisponibilidade' : 'Nova Indisponibilidade'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="musicoId">Músico</Label>
              <Select value={formData.musicoId} onValueChange={(value) => setFormData({ ...formData, musicoId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um músico" />
                </SelectTrigger>
                <SelectContent>
                  {musicos.map((musico) => (
                    <SelectItem key={musico.id} value={musico.id}>
                      {musico.nome} - {musico.funcao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataInicio">Data de Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dataFim">Data de Fim (opcional)</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                  min={formData.dataInicio}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="motivo">Motivo</Label>
              <Select value={formData.motivo} onValueChange={(value: any) => setFormData({ ...formData, motivo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MOTIVOS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.motivo === 'outro' && (
              <div>
                <Label htmlFor="motivoOutro">Especificar motivo</Label>
                <Input
                  id="motivoOutro"
                  value={formData.motivoOutro}
                  onChange={(e) => setFormData({ ...formData, motivoOutro: e.target.value })}
                  placeholder="Digite o motivo..."
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!formData.musicoId || !formData.dataInicio}>
                {editingItem ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}