import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Music, Youtube, Download, Plus, FileText } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import { PartituraManager } from './PartituraManager';

interface YouTubeResult {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  url: string;
  duration: string;
}

interface SearchResults {
  youtube: YouTubeResult[];
  cifrasGoiania: string;
}

export function YouTubeSearchCard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showPartituraManager, setShowPartituraManager] = useState(false);
  const [partituraVideo, setPartituraVideo] = useState<YouTubeResult | null>(null);
  const { get, post } = useApi();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      console.log('Searching for:', searchTerm);
      const results = await get(`/search/music?q=${encodeURIComponent(searchTerm)}`);
      console.log('Search results:', results);
      setSearchResults(results);
      
      if (!results.youtube || results.youtube.length === 0) {
        toast.info('Nenhuma música encontrada no YouTube');
      } else {
        toast.success(`${results.youtube.length} músicas encontradas!`);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      toast.error('Erro ao buscar músicas');
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateMP3Link = async (youtubeUrl: string) => {
    try {
      const response = await post('/search/youtube-to-mp3', { youtubeUrl });
      window.open(response.mp3Link, '_blank');
    } catch (error) {
      console.error('Erro ao gerar link MP3:', error);
      toast.error('Erro ao gerar link de download');
    }
  };

  const handleProcurarPartitura = (video: YouTubeResult) => {
    setPartituraVideo(video);
    setShowPartituraManager(true);
  };

  const handleAddToBiblioteca = async (video: YouTubeResult) => {
    try {
      const musicData = {
        nome: video.title,
        cantor: video.channelTitle,
        link_youtube: video.url,
        youtube_video_id: video.id,
        thumbnail: video.thumbnail,
        duracao: video.duration,
        secao_liturgica: '',
        observacoes: ''
      };
      
      await post('/biblioteca-musicas', musicData);
      toast.success('Música adicionada à biblioteca!');
    } catch (error) {
      console.error('Erro ao adicionar música:', error);
      toast.error('Erro ao adicionar música à biblioteca');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Buscar Músicas no YouTube
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Digite o nome da música..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>

          {/* Results */}
          {searchResults && (
            <div className="space-y-4">
              {searchResults.youtube.length > 0 ? (
                <div className="grid gap-4">
                  {searchResults.youtube.map((result) => (
                    <Card key={result.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={result.thumbnail}
                            alt={result.title}
                            className="w-24 h-18 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm leading-tight mb-1 line-clamp-2">
                              {result.title}
                            </h3>
                            <p className="text-xs text-gray-600 mb-2">
                              {result.channelTitle}
                            </p>
                            <div className="flex items-center gap-1 mb-3">
                              <Badge variant="secondary" className="text-xs">
                                {result.duration}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(result.url, '_blank')}
                              >
                                <Youtube className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAddToBiblioteca(result)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Adicionar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleGenerateMP3Link(result.url)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                MP3
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleProcurarPartitura(result)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Partitura
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma música encontrada
                  </h3>
                  <p className="text-gray-600">
                    Tente pesquisar com termos diferentes
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <PartituraManager
        youtubeVideo={partituraVideo ? {
          id: partituraVideo.id,
          title: partituraVideo.title,
          channelTitle: partituraVideo.channelTitle
        } : undefined}
        isOpen={showPartituraManager}
        onClose={() => setShowPartituraManager(false)}
        onSave={(partitura) => {
          if (partituraVideo) {
            handleAddToBiblioteca({
              ...partituraVideo,
              // Add partitura to the video data when saving
            });
          }
        }}
      />
    </>
  );
}