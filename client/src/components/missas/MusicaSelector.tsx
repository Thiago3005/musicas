import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Music, Search, Plus, FileText, Youtube } from 'lucide-react';
import { useBibliotecaMusicas, BibliotecaMusica } from '@/hooks/useApi';
import { SECOES_LITURGICAS, SecaoLiturgica } from '@/types';
import { toast } from 'sonner';

interface MusicaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMusica: (musica: BibliotecaMusica, secaoLiturgica: SecaoLiturgica) => void;
  secaoInicial?: SecaoLiturgica;
}

export function MusicaSelector({ isOpen, onClose, onSelectMusica, secaoInicial = 'entrada' }: MusicaSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [secaoFiltro, setSecaoFiltro] = useState<SecaoLiturgica | 'todas'>('todas');
  const [secaoSelecionada, setSecaoSelecionada] = useState<SecaoLiturgica>(secaoInicial);
  const { musicas, loading } = useBibliotecaMusicas();

  useEffect(() => {
    setSecaoSelecionada(secaoInicial);
  }, [secaoInicial]);

  const musicasFiltradas = musicas.filter(musica => {
    const matchesSearch = musica.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         musica.cantor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSecao = secaoFiltro === 'todas' || musica.secao_liturgica === secaoFiltro;
    
    return matchesSearch && matchesSecao;
  });

  const handleSelectMusica = (musica: BibliotecaMusica) => {
    onSelectMusica(musica, secaoSelecionada);
    toast.success('Música adicionada à missa!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Selecionar Música da Biblioteca
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seção para adicionar */}
          <div>
            <label className="text-sm font-medium mb-2 block">Adicionar na seção:</label>
            <Select value={secaoSelecionada} onValueChange={(value: SecaoLiturgica) => setSecaoSelecionada(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SECOES_LITURGICAS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar:</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Nome da música ou cantor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Filtrar por seção:</label>
              <Select value={secaoFiltro} onValueChange={(value: SecaoLiturgica | 'todas') => setSecaoFiltro(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as seções</SelectItem>
                  {Object.entries(SECOES_LITURGICAS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de músicas */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">Carregando músicas...</div>
            ) : musicasFiltradas.length === 0 ? (
              <div className="text-center py-8">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma música encontrada
                </h3>
                <p className="text-gray-600">
                  Tente ajustar os filtros ou adicione músicas à biblioteca primeiro
                </p>
              </div>
            ) : (
              musicasFiltradas.map((musica) => (
                <Card key={musica.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {musica.thumbnail && (
                            <img
                              src={musica.thumbnail}
                              alt={musica.nome}
                              className="w-16 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium">{musica.nome}</h4>
                            {musica.cantor && (
                              <p className="text-sm text-gray-600">{musica.cantor}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {musica.secao_liturgica && (
                                <Badge variant="outline" className="text-xs">
                                  {SECOES_LITURGICAS[musica.secao_liturgica as SecaoLiturgica]}
                                </Badge>
                              )}
                              {musica.duracao && (
                                <Badge variant="secondary" className="text-xs">
                                  {musica.duracao}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Partitura preview */}
                        {musica.partitura && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <div className="flex items-center gap-1 mb-1">
                              <FileText className="h-3 w-3" />
                              <span className="font-medium">Partitura:</span>
                            </div>
                            <div className="font-mono text-gray-700 max-h-20 overflow-y-auto">
                              {musica.partitura.substring(0, 200)}
                              {musica.partitura.length > 200 && '...'}
                            </div>
                          </div>
                        )}

                        {/* Links */}
                        <div className="flex gap-2 mt-2">
                          {musica.link_youtube && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(musica.link_youtube, '_blank')}
                            >
                              <Youtube className="h-3 w-3 mr-1" />
                              YouTube
                            </Button>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleSelectMusica(musica)}
                        className="ml-4"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}