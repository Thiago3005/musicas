
import { useState } from 'react';
import { Search, Music, Youtube, Download, ExternalLink, Plus, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import { PartituraManager } from './PartituraManager';

interface YouTubeResult {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  duration: string;
  url: string;
}

interface SearchResults {
  youtube: YouTubeResult[];
  cifrasGoiania: string;
  cnvMp3Generator: string;
}

export function BuscarMusicas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<YouTubeResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPartituraManager, setShowPartituraManager] = useState(false);
  const [partituraVideo, setPartituraVideo] = useState<YouTubeResult | null>(null);
  const [activeTab, setActiveTab] = useState<'youtube' | 'partituras'>('youtube');
  const { get, post } = useApi();

  const [formData, setFormData] = useState({
    nome: '',
    cantor: '',
    link_youtube: '',
    partitura_texto: '',
    link_download: '',
    secao_liturgica: '',
    observacoes: '',
    youtube_video_id: '',
    thumbnail: '',
    duracao: '',
    link_cifras_goiania: ''
  });

  const secoesLiturgicas = [
    'Entrada',
    'Ato Penitencial',
    'Glória',
    'Salmo Responsorial',
    'Aclamação ao Evangelho',
    'Ofertório',
    'Santo',
    'Cordeiro de Deus',
    'Comunhão',
    'Final'
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await get(`/search/music?q=${encodeURIComponent(searchTerm)}`);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro na busca:', error);
      toast.error('Erro ao buscar músicas');
    }
    setIsSearching(false);
  };

  const handleSelectMusic = (music: YouTubeResult) => {
    setSelectedMusic(music);
    setFormData({
      nome: music.title,
      cantor: music.channelTitle,
      link_youtube: music.url,
      partitura_texto: '',
      link_download: '',
      secao_liturgica: '',
      observacoes: '',
      youtube_video_id: music.id,
      thumbnail: music.thumbnail,
      duracao: music.duration,
      link_cifras_goiania: searchResults?.cifrasGoiania || ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveToLibrary = async () => {
    try {
      await post('/biblioteca-musicas', formData);
      toast.success('Música adicionada à biblioteca com sucesso!');
      setIsDialogOpen(false);
      setFormData({
        nome: '',
        cantor: '',
        link_youtube: '',
        partitura_texto: '',
        link_download: '',
        secao_liturgica: '',
        observacoes: '',
        youtube_video_id: '',
        thumbnail: '',
        duracao: '',
        link_cifras_goiania: ''
      });
    } catch (error) {
      console.error('Erro ao salvar música:', error);
      toast.error('Erro ao salvar música na biblioteca');
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

  const handleSalvarPartitura = (partitura: string) => {
    if (partituraVideo) {
      setFormData({
        ...formData,
        partitura_texto: partitura,
        nome: partituraVideo.title,
        cantor: partituraVideo.channelTitle,
        link_youtube: partituraVideo.url,
        youtube_video_id: partituraVideo.id,
        thumbnail: partituraVideo.thumbnail,
        duracao: partituraVideo.duration
      });
      setSelectedMusic(partituraVideo);
      setIsDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Buscar Músicas</h1>
        <p className="text-muted-foreground">
          Sistema inteligente de busca de partituras e recursos litúrgicos
        </p>
      </div>

      {/* Tabs para diferentes tipos de busca */}
      <div className="flex space-x-1 rounded-lg bg-muted p-1">
        <button
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'youtube'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('youtube')}
        >
          <Youtube className="w-4 h-4 inline mr-2" />
          Busca no YouTube
        </button>
        <button
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'partituras'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('partituras')}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Busca Inteligente de Partituras
        </button>
      </div>

      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {activeTab === 'youtube' ? 'Busca de Músicas no YouTube' : 'Busca Inteligente de Partituras'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'youtube' 
              ? 'Encontre vídeos musicais no YouTube para adicionar à biblioteca'
              : 'Digite o nome da música para encontrar partituras na Arquidiocese de Goiânia'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o nome da música..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Links rápidos */}
      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle>Links Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(searchResults.cifrasGoiania, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Cifras e Partituras - Goiânia
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(searchResults.cnvMp3Generator, '_blank')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                CNV MP3 (Download de Áudio)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados do YouTube */}
      {searchResults?.youtube && searchResults.youtube.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600" />
              Resultados do YouTube
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.youtube.map((result) => (
                <Card key={result.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img
                      src={result.thumbnail}
                      alt={result.title}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                      {result.duration}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {result.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      {result.channelTitle}
                    </p>
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
                        onClick={() => handleSelectMusic(result)}
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para adicionar música à biblioteca */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar à Biblioteca</DialogTitle>
            <DialogDescription>
              Complete as informações da música para adicionar à biblioteca
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome *
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cantor" className="text-right">
                Cantor/Artista
              </Label>
              <Input
                id="cantor"
                value={formData.cantor}
                onChange={(e) => setFormData({ ...formData, cantor: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="secao_liturgica" className="text-right">
                Seção Litúrgica
              </Label>
              <Select
                value={formData.secao_liturgica}
                onValueChange={(value) => setFormData({ ...formData, secao_liturgica: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a seção" />
                </SelectTrigger>
                <SelectContent>
                  {secoesLiturgicas.map((secao) => (
                    <SelectItem key={secao} value={secao}>
                      {secao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link_youtube" className="text-right">
                Link YouTube
              </Label>
              <Input
                id="link_youtube"
                value={formData.link_youtube}
                onChange={(e) => setFormData({ ...formData, link_youtube: e.target.value })}
                className="col-span-3"
                readOnly
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link_download" className="text-right">
                Link Download
              </Label>
              <Input
                id="link_download"
                value={formData.link_download}
                onChange={(e) => setFormData({ ...formData, link_download: e.target.value })}
                className="col-span-3"
                placeholder="Link para download da música"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="partitura_texto" className="text-right pt-2">
                Partitura (Texto)
              </Label>
              <Textarea
                id="partitura_texto"
                value={formData.partitura_texto}
                onChange={(e) => setFormData({ ...formData, partitura_texto: e.target.value })}
                className="col-span-3 min-h-[120px] font-mono"
                placeholder="Cole aqui o texto da partitura, cifras ou acordes..."
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="observacoes" className="text-right pt-2">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="col-span-3"
                placeholder="Observações adicionais sobre a música..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveToLibrary} disabled={!formData.nome}>
              Salvar na Biblioteca
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Partitura Manager */}
      <PartituraManager
        youtubeVideo={partituraVideo ? {
          id: partituraVideo.id,
          title: partituraVideo.title,
          channelTitle: partituraVideo.channelTitle
        } : undefined}
        isOpen={showPartituraManager}
        onClose={() => setShowPartituraManager(false)}
        onSave={handleSalvarPartitura}
      />
    </div>
  );
}
