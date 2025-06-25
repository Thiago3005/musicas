import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Users, Plus, Trash2, Copy } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';

interface EscalacaoDefault {
  id: string;
  musico_id: string;
  musico_nome: string;
  parte_missa: string;
  funcao: string;
  instrumento?: string;
}

interface EscalacoesDefaultProps {
  isOpen: boolean;
  onClose: () => void;
  onAplicarDefault: (escalacoes: EscalacaoDefault[]) => void;
}

const PARTES_MISSA = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'kyrie', label: 'Kyrie' },
  { value: 'gloria', label: 'Gloria' },
  { value: 'aclamacao', label: 'Aclamação ao Evangelho' },
  { value: 'ofertorio', label: 'Ofertório' },
  { value: 'sanctus', label: 'Sanctus' },
  { value: 'comunhao', label: 'Comunhão' },
  { value: 'saida', label: 'Saída' },
];

const FUNCOES = [
  { value: 'vocal', label: 'Vocal Principal' },
  { value: 'backvocal', label: 'Back Vocal' },
  { value: 'instrumental', label: 'Instrumental' },
  { value: 'solista', label: 'Solista' },
];

export function EscalacoesDefault({ isOpen, onClose, onAplicarDefault }: EscalacoesDefaultProps) {
  const [escalacoesPadrao, setEscalacoesPadrao] = useState<EscalacaoDefault[]>([]);
  const [musicos, setMusicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [novaEscalacao, setNovaEscalacao] = useState({
    musico_id: '',
    parte_missa: '',
    funcao: 'vocal',
    instrumento: ''
  });
  const { get, post, put, del } = useApi();

  useEffect(() => {
    if (isOpen) {
      fetchEscalacoesPadrao();
      fetchMusicos();
    }
  }, [isOpen]);

  const fetchEscalacoesPadrao = async () => {
    try {
      // Carregar do localStorage por enquanto
      const saved = localStorage.getItem('escalacoes_padrao');
      if (saved) {
        setEscalacoesPadrao(JSON.parse(saved));
      } else {
        setEscalacoesPadrao([]);
      }
    } catch (error) {
      console.error('Erro ao carregar escalações padrão:', error);
      setEscalacoesPadrao([]);
    }
  };

  const fetchMusicos = async () => {
    try {
      const musicosData = await get('/musicos');
      setMusicos(musicosData.filter((m: any) => m.disponivel));
    } catch (error) {
      console.error('Erro ao carregar músicos:', error);
      toast.error('Erro ao carregar lista de músicos');
    }
  };

  const handleAddEscalacao = async () => {
    if (!novaEscalacao.musico_id || !novaEscalacao.parte_missa) {
      toast.error('Por favor, selecione o músico e a parte da missa');
      return;
    }

    const musico = musicos.find(m => m.id === novaEscalacao.musico_id);
    const novaEscalacaoPadrao: EscalacaoDefault = {
      id: Date.now().toString(), // Temporary ID
      musico_id: novaEscalacao.musico_id,
      musico_nome: musico?.nome || '',
      parte_missa: novaEscalacao.parte_missa,
      funcao: novaEscalacao.funcao,
      instrumento: novaEscalacao.instrumento
    };

    setEscalacoesPadrao([...escalacoesPadrao, novaEscalacaoPadrao]);
    setShowAddForm(false);
    setNovaEscalacao({
      musico_id: '',
      parte_missa: '',
      funcao: 'vocal',
      instrumento: ''
    });
    
    toast.success('Escalação padrão adicionada!');
  };

  const handleRemoveEscalacao = (id: string) => {
    setEscalacoesPadrao(escalacoesPadrao.filter(e => e.id !== id));
    toast.success('Escalação padrão removida!');
  };

  const handleSalvarEscalacoes = async () => {
    try {
      setLoading(true);
      // Salvar no localStorage por enquanto
      localStorage.setItem('escalacoes_padrao', JSON.stringify(escalacoesPadrao));
      toast.success('Escalações padrão salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar escalações padrão:', error);
      toast.error('Erro ao salvar escalações padrão');
    } finally {
      setLoading(false);
    }
  };

  const handleAplicarDefault = () => {
    onAplicarDefault(escalacoesPadrao);
    toast.success('Escalações padrão aplicadas à missa!');
    onClose();
  };

  const getParteLabel = (parte: string) => {
    return PARTES_MISSA.find(p => p.value === parte)?.label || parte;
  };

  const getFuncaoLabel = (funcao: string) => {
    return FUNCOES.find(f => f.value === funcao)?.label || funcao;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Escalações Padrão
          </DialogTitle>
          <DialogDescription>
            Configure escalações padrão que podem ser aplicadas rapidamente a qualquer missa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Botões de ação */}
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Escalação
            </Button>
            <div className="flex gap-2">
              <Button onClick={handleSalvarEscalacoes} disabled={loading}>
                Salvar Configuração
              </Button>
              <Button onClick={handleAplicarDefault} variant="secondary">
                <Copy className="h-4 w-4 mr-2" />
                Aplicar na Missa
              </Button>
            </div>
          </div>

          {/* Formulário para adicionar nova escalação */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Nova Escalação Padrão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Músico</label>
                    <Select
                      value={novaEscalacao.musico_id}
                      onValueChange={(value) => setNovaEscalacao({ ...novaEscalacao, musico_id: value })}
                    >
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

                  <div>
                    <label className="text-sm font-medium mb-2 block">Parte da Missa</label>
                    <Select
                      value={novaEscalacao.parte_missa}
                      onValueChange={(value) => setNovaEscalacao({ ...novaEscalacao, parte_missa: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a parte" />
                      </SelectTrigger>
                      <SelectContent>
                        {PARTES_MISSA.map((parte) => (
                          <SelectItem key={parte.value} value={parte.value}>
                            {parte.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Função</label>
                    <Select
                      value={novaEscalacao.funcao}
                      onValueChange={(value) => setNovaEscalacao({ ...novaEscalacao, funcao: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FUNCOES.map((funcao) => (
                          <SelectItem key={funcao.value} value={funcao.value}>
                            {funcao.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Instrumento (opcional)</label>
                    <Select
                      value={novaEscalacao.instrumento}
                      onValueChange={(value) => setNovaEscalacao({ ...novaEscalacao, instrumento: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o instrumento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        <SelectItem value="Violão">Violão</SelectItem>
                        <SelectItem value="Piano">Piano</SelectItem>
                        <SelectItem value="Flauta">Flauta</SelectItem>
                        <SelectItem value="Bateria">Bateria</SelectItem>
                        <SelectItem value="Baixo">Baixo</SelectItem>
                        <SelectItem value="Guitarra">Guitarra</SelectItem>
                        <SelectItem value="Teclado">Teclado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddEscalacao}>
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de escalações padrão */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Escalações Configuradas</h3>
            {escalacoesPadrao.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma escalação padrão configurada</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Adicione escalações que serão usadas frequentemente
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {escalacoesPadrao.map((escalacao) => (
                  <Card key={escalacao.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{escalacao.musico_nome}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary">{getParteLabel(escalacao.parte_missa)}</Badge>
                              <Badge variant="outline">{getFuncaoLabel(escalacao.funcao)}</Badge>
                              {escalacao.instrumento && (
                                <Badge variant="outline">{escalacao.instrumento}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveEscalacao(escalacao.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}