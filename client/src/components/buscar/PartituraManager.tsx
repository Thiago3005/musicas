import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Plus, ExternalLink } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';

interface PartituraManagerProps {
  youtubeVideo?: {
    id: string;
    title: string;
    channelTitle: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSave?: (partitura: string) => void;
}

export function PartituraManager({ youtubeVideo, isOpen, onClose, onSave }: PartituraManagerProps) {
  const [searchTerm, setSearchTerm] = useState(youtubeVideo?.title || '');
  const [partituraTexto, setPartituraTexto] = useState('');
  const [linkPartitura, setLinkPartitura] = useState('');
  const [searchResult, setSearchResult] = useState<string>('');
  const [searching, setSearching] = useState(false);
  const { get } = useApi();

  const handleBuscarPartitura = async () => {
    if (!searchTerm.trim()) return;
    
    setSearching(true);
    try {
      const result = await get(`/buscar-partitura?q=${encodeURIComponent(searchTerm)}`);
      setSearchResult(result.link);
      toast.success('Link de busca gerado!');
    } catch (error) {
      console.error('Erro ao buscar partitura:', error);
      toast.error('Erro ao buscar partitura');
    } finally {
      setSearching(false);
    }
  };

  const handleSalvarPartitura = () => {
    const partituraFinal = partituraTexto || linkPartitura;
    if (partituraFinal.trim()) {
      onSave?.(partituraFinal);
      toast.success('Partitura salva!');
      onClose();
    } else {
      toast.error('Por favor, adicione uma partitura ou link');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerenciar Partitura
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da música */}
          {youtubeVideo && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-1">{youtubeVideo.title}</h3>
                <p className="text-sm text-gray-600">{youtubeVideo.channelTitle}</p>
              </CardContent>
            </Card>
          )}

          {/* Buscar partitura online */}
          <div className="space-y-3">
            <h4 className="font-medium">Buscar Partitura Online</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Digite o nome da música para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleBuscarPartitura()}
                className="flex-1"
              />
              <Button onClick={handleBuscarPartitura} disabled={searching}>
                <Search className="h-4 w-4 mr-2" />
                {searching ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>

            {searchResult && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  Link gerado para busca na Arquidiocese de Goiânia:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(searchResult, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  Abrir Busca de Partitura
                </Button>
              </div>
            )}
          </div>

          {/* Adicionar partitura em texto */}
          <div className="space-y-3">
            <h4 className="font-medium">Adicionar Partitura (Texto)</h4>
            <Textarea
              placeholder="Cole aqui o texto da partitura, cifras ou acordes..."
              value={partituraTexto}
              onChange={(e) => setPartituraTexto(e.target.value)}
              className="min-h-[120px] font-mono"
            />
          </div>

          {/* Link da partitura */}
          <div className="space-y-3">
            <h4 className="font-medium">Link da Partitura</h4>
            <Input
              placeholder="URL da partitura (ex: link para PDF ou imagem)"
              value={linkPartitura}
              onChange={(e) => setLinkPartitura(e.target.value)}
            />
          </div>

          {/* Preview */}
          {(partituraTexto || linkPartitura) && (
            <div className="space-y-3">
              <h4 className="font-medium">Preview</h4>
              <div className="p-3 bg-gray-50 rounded">
                {partituraTexto && (
                  <div className="mb-3">
                    <Badge variant="outline" className="mb-2">Texto</Badge>
                    <div className="font-mono text-sm whitespace-pre-wrap">
                      {partituraTexto.substring(0, 200)}
                      {partituraTexto.length > 200 && '...'}
                    </div>
                  </div>
                )}
                {linkPartitura && (
                  <div>
                    <Badge variant="outline" className="mb-2">Link</Badge>
                    <p className="text-sm text-blue-600 break-all">{linkPartitura}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarPartitura}>
              <Plus className="h-4 w-4 mr-2" />
              Salvar Partitura
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}