import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Music, Users, Mic, Guitar, Settings } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import { EscalacoesDefault } from './EscalacoesDefault';

interface Musico {
  id: string;
  nome: string;
  funcao: string;
  disponivel: boolean;
  instrumento?: string;
}

interface EscalarMusicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  missaId: string;
  onMusicoEscalado: () => void;
}

interface EscalacaoDefault {
  id: string;
  musico_id: string;
  musico_nome: string;
  parte_missa: string;
  funcao: string;
  instrumento?: string;
}

const PARTES_MISSA = [
  { value: 'entrada', label: 'Entrada', icon: Music },
  { value: 'kyrie', label: 'Kyrie', icon: Music },
  { value: 'gloria', label: 'Gloria', icon: Music },
  { value: 'aclamacao', label: 'Aclamação ao Evangelho', icon: Music },
  { value: 'ofertorio', label: 'Ofertório', icon: Music },
  { value: 'sanctus', label: 'Sanctus', icon: Music },
  { value: 'comunhao', label: 'Comunhão', icon: Music },
  { value: 'saida', label: 'Saída', icon: Music },
];

const FUNCOES = [
  { value: 'vocal', label: 'Vocal Principal', icon: Mic },
  { value: 'backvocal', label: 'Back Vocal', icon: Users },
  { value: 'instrumental', label: 'Instrumental', icon: Guitar },
  { value: 'solista', label: 'Solista', icon: Mic },
];

export function EscalarMusicoModal({ isOpen, onClose, missaId, onMusicoEscalado }: EscalarMusicoModalProps) {
  const [musicos, setMusicos] = useState<Musico[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEscalacaoDefault, setShowEscalacaoDefault] = useState(false);
  const [formData, setFormData] = useState({
    musico_id: '',
    parte_missa: '',
    funcao: 'vocal',
    instrumento: '',
    observacoes: ''
  });
  const { get, post } = useApi();

  useEffect(() => {
    if (isOpen) {
      fetchMusicos();
    }
  }, [isOpen]);

  const fetchMusicos = async () => {
    try {
      setLoading(true);
      const response = await get('/musicos');
      setMusicos(response.filter((m: Musico) => m.disponivel));
    } catch (error) {
      console.error('Erro ao carregar músicos:', error);
      toast.error('Erro ao carregar lista de músicos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.musico_id || !formData.parte_missa) {
      toast.error('Por favor, selecione o músico e a parte da missa');
      return;
    }

    try {
      setLoading(true);
      await post('/missa-musicos', {
        missa_id: missaId,
        ...formData
      });
      
      toast.success('Músico escalado com sucesso!');
      onMusicoEscalado();
      onClose();
      setFormData({
        musico_id: '',
        parte_missa: '',
        funcao: 'vocal',
        instrumento: '',
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao escalar músico:', error);
      toast.error('Erro ao escalar músico');
    } finally {
      setLoading(false);
    }
  };

  const handleAplicarEscalacaoDefault = async (escalacoes: EscalacaoDefault[]) => {
    try {
      setLoading(true);
      for (const escalacao of escalacoes) {
        await post('/missa-musicos', {
          missa_id: missaId,
          musico_id: escalacao.musico_id,
          parte_missa: escalacao.parte_missa,
          funcao: escalacao.funcao,
          instrumento: escalacao.instrumento || '',
          observacoes: ''
        });
      }
      toast.success(`${escalacoes.length} músicos escalados com sucesso!`);
      onMusicoEscalado();
      onClose();
    } catch (error) {
      console.error('Erro ao aplicar escalação padrão:', error);
      toast.error('Erro ao aplicar escalação padrão');
    } finally {
      setLoading(false);
    }
  };

  const selectedMusico = musicos.find(m => m.id === formData.musico_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Escalar Músico para Missa
          </DialogTitle>
          <DialogDescription>
            Selecione o músico, a parte da missa e a função que ele irá desempenhar
          </DialogDescription>
        </DialogHeader>

        {/* Botões de ações rápidas */}
        <div className="flex gap-2 pb-4 border-b">
          <Button
            variant="outline"
            onClick={() => setShowEscalacaoDefault(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Usar Escalação Padrão
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="musico">Músico</Label>
              <Select 
                value={formData.musico_id} 
                onValueChange={(value) => setFormData({ ...formData, musico_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um músico" />
                </SelectTrigger>
                <SelectContent>
                  {musicos.map((musico) => (
                    <SelectItem key={musico.id} value={musico.id}>
                      <div className="flex items-center gap-2">
                        <span>{musico.nome}</span>
                        <Badge variant="secondary" className="text-xs">
                          {musico.funcao}
                        </Badge>
                        {musico.instrumento && (
                          <Badge variant="outline" className="text-xs">
                            {musico.instrumento}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parte_missa">Parte da Missa</Label>
              <Select 
                value={formData.parte_missa} 
                onValueChange={(value) => setFormData({ ...formData, parte_missa: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a parte" />
                </SelectTrigger>
                <SelectContent>
                  {PARTES_MISSA.map((parte) => (
                    <SelectItem key={parte.value} value={parte.value}>
                      <div className="flex items-center gap-2">
                        <parte.icon className="h-4 w-4" />
                        {parte.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="funcao">Função</Label>
              <Select 
                value={formData.funcao} 
                onValueChange={(value) => setFormData({ ...formData, funcao: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUNCOES.map((funcao) => (
                    <SelectItem key={funcao.value} value={funcao.value}>
                      <div className="flex items-center gap-2">
                        <funcao.icon className="h-4 w-4" />
                        {funcao.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instrumento">Instrumento (opcional)</Label>
              <Input
                id="instrumento"
                value={formData.instrumento}
                onChange={(e) => setFormData({ ...formData, instrumento: e.target.value })}
                placeholder="Ex: Violão, Piano, Flauta..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações específicas sobre esta escalação..."
              rows={3}
            />
          </div>

          {selectedMusico && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Músico Selecionado:</h4>
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedMusico.nome}</span>
                <Badge variant="secondary">{selectedMusico.funcao}</Badge>
                {selectedMusico.instrumento && (
                  <Badge variant="outline">{selectedMusico.instrumento}</Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Escalando...' : 'Escalar Músico'}
            </Button>
          </div>
        </form>

        {/* Modal de Escalação Padrão */}
        {showEscalacaoDefault && (
          <EscalacoesDefault
            isOpen={showEscalacaoDefault}
            onClose={() => setShowEscalacaoDefault(false)}
            onAplicarDefault={handleAplicarEscalacaoDefault}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}