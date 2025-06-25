import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Plus, Check, X, Edit3, Filter } from 'lucide-react';
import { useSupabaseMusicos } from '../../hooks/useApi';
import { toast } from '@/hooks/use-toast';

export function SugestoesManager() {
  const { musicos, sugestoes, adicionarSugestao, atualizarStatusSugestao } = useSupabaseMusicos();
  const [showForm, setShowForm] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const [filtroMusico, setFiltroMusico] = useState<string>('todos');
  
  const [novasugestao, setNovaSugestao] = useState({
    musico_id: '',
    texto: '',
    tipo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novasugestao.musico_id || !novasugestao.texto) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    try {
      await adicionarSugestao(novasugestao.musico_id, novasugestao.texto);
      setNovaSugestao({ musico_id: '', texto: '', tipo: '' });
      setShowForm(false);
      toast({
        title: 'Sucesso',
        description: 'Sugestão registrada com sucesso!'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao registrar sugestão',
        variant: 'destructive'
      });
    }
  };

  const handleStatusChange = async (sugestaoId: string, novoStatus: string, musicoId: string) => {
    try {
      await atualizarStatusSugestao(sugestaoId, novoStatus, musicoId);
      toast({
        title: 'Sucesso',
        description: 'Status da sugestão atualizado!'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar status',
        variant: 'destructive'
      });
    }
  };

  // Combinar todas as sugestões de todos os músicos
  const todasSugestoes = Object.entries(sugestoes).flatMap(([musicoId, sugestoesList]) => 
    sugestoesList.map(sugestao => ({
      ...sugestao,
      musico: musicos.find(m => m.id === musicoId),
      musicoId
    }))
  );

  // Aplicar filtros
  const sugestoesFiltradas = todasSugestoes.filter(sugestao => {
    const matchStatus = filtroStatus === 'todas' || sugestao.status === filtroStatus;
    const matchMusico = filtroMusico === 'todos' || sugestao.musicoId === filtroMusico;
    return matchStatus && matchMusico;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-orange-100 text-orange-800';
      case 'implementada':
        return 'bg-green-100 text-green-800';
      case 'recusada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Sugestões dos Músicos
          </h1>
          <p className="text-gray-600 mt-1">Gerencie todas as sugestões registradas</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800">
          <Plus className="h-4 w-4 mr-2" />
          Nova Sugestão
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="implementada">Implementadas</SelectItem>
                  <SelectItem value="recusada">Recusadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Músico</label>
              <Select value={filtroMusico} onValueChange={setFiltroMusico}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {musicos.map(musico => (
                    <SelectItem key={musico.id} value={musico.id}>
                      {musico.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form de Nova Sugestão */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nova Sugestão</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Músico *</label>
                  <Select 
                    value={novasugestao.musico_id} 
                    onValueChange={(value) => setNovaSugestao({...novasugestao, musico_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o músico" />
                    </SelectTrigger>
                    <SelectContent>
                      {musicos.map(musico => (
                        <SelectItem key={musico.id} value={musico.id}>
                          {musico.nome} - {musico.funcao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo</label>
                  <Input
                    placeholder="Ex: Música, Equipamento, Procedimento..."
                    value={novasugestao.tipo}
                    onChange={(e) => setNovaSugestao({...novasugestao, tipo: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Descrição da Sugestão *</label>
                <Textarea
                  placeholder="Descreva a sugestão do músico..."
                  value={novasugestao.texto}
                  onChange={(e) => setNovaSugestao({...novasugestao, texto: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Registrar Sugestão</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Sugestões */}
      <div className="grid grid-cols-1 gap-4">
        {sugestoesFiltradas.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma sugestão encontrada
              </h3>
              <p className="text-gray-600">
                {filtroStatus !== 'todas' || filtroMusico !== 'todos'
                  ? 'Tente ajustar os filtros para ver mais resultados.'
                  : 'Registre a primeira sugestão clicando no botão acima.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          sugestoesFiltradas.map((sugestao) => (
            <Card key={sugestao.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{sugestao.musico?.nome}</h4>
                      <Badge variant="outline">{sugestao.musico?.funcao}</Badge>
                      <Badge className={getStatusColor(sugestao.status)}>
                        {sugestao.status}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{sugestao.texto}</p>
                    <p className="text-sm text-gray-500">
                      Registrada em: {new Date(sugestao.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {sugestao.status === 'pendente' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(sugestao.id, 'implementada', sugestao.musicoId)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(sugestao.id, 'recusada', sugestao.musicoId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}