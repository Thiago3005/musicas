
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, Search, Play, Download, Trash2, ExternalLink } from 'lucide-react';
import { useBibliotecaMusicas, BibliotecaMusica } from '../../hooks/useApi';
import { toast } from '@/hooks/use-toast';
import { SECOES_LITURGICAS, SecaoLiturgica } from '../../types';

export function BibliotecaMusicas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [secaoFiltro, setSecaoFiltro] = useState<SecaoLiturgica | 'todas'>('todas');
  const { musicas, loading, removerMusica } = useBibliotecaMusicas();

  const handleRemoverMusica = async (id: string) => {
    try {
      await removerMusica(id);
      toast({
        title: 'Sucesso',
        description: 'Música removida da biblioteca!'
      });
    } catch (error) {
      console.error('Erro ao remover música:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover música da biblioteca',
        variant: 'destructive'
      });
    }
  };

  const downloadMp3 = (musica: BibliotecaMusica) => {
    if (musica.youtube_video_id) {
      const converterUrl = `https://cnvmp3.com/v25/${musica.youtube_video_id}`;
      window.open(converterUrl, '_blank');
    } else if (musica.link_youtube) {
      const videoId = musica.link_youtube.split('watch?v=')[1]?.split('&')[0];
      if (videoId) {
        const converterUrl = `https://cnvmp3.com/v25/${videoId}`;
        window.open(converterUrl, '_blank');
      }
    }
  };

  const musicasFiltradas = musicas.filter(musica => {
    const matchesSearch = musica.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         musica.cantor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSecao = secaoFiltro === 'todas' || musica.secao_liturgica === secaoFiltro;
    return matchesSearch && matchesSecao;
  });



  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p>Carregando biblioteca...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Biblioteca de Músicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar músicas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={secaoFiltro} onValueChange={(value) => setSecaoFiltro(value as SecaoLiturgica | 'todas')}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por seção" />
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

          {musicasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {musicas.length === 0 ? 'Biblioteca vazia' : 'Nenhuma música encontrada'}
              </h3>
              <p className="text-gray-600">
                {musicas.length === 0 
                  ? 'Comece salvando músicas da busca do YouTube'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {musicasFiltradas.map((musica) => (
                <Card key={musica.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    {musica.thumbnail && (
                      <div className="relative mb-4">
                        <img
                          src={musica.thumbnail}
                          alt={musica.nome}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {musica.duracao && (
                          <Badge variant="secondary" className="absolute bottom-2 right-2 bg-black/70 text-white">
                            {musica.duracao}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <h4 className="font-medium text-sm line-clamp-2 mb-2">
                      {musica.nome}
                    </h4>
                    
                    {musica.cantor && (
                      <p className="text-sm text-gray-600 mb-2">
                        {musica.cantor}
                      </p>
                    )}
                    
                    {musica.secao_liturgica && (
                      <Badge variant="outline" className="mb-3 text-xs">
                        {SECOES_LITURGICAS[musica.secao_liturgica as SecaoLiturgica]}
                      </Badge>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {musica.link_youtube && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(musica.link_youtube, '_blank')}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadMp3(musica)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        MP3
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoverMusica(musica.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
